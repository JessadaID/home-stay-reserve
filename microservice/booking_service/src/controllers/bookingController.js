// src/controllers/bookingController.js
// Handles all booking CRUD operations with business logic

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

// Helper: get base URL of room_service
const getRoomServiceUrl = () => process.env.ROOM_SERVICE_URL || 'http://localhost:5130';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/bookings
// Create a new booking (requires: customer or admin)
// ─────────────────────────────────────────────────────────────────────────────
exports.createBooking = async (req, res) => {
    const { room_id, customer_name, check_in, check_out } = req.body;
    const customer_id = req.user.userId;

    if (!room_id || !customer_name || !check_in || !check_out) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const baseUrl = getRoomServiceUrl();

        // 1. Check if room exists via room_service HTTP call
        let roomDetails;
        try {
            const roomResponse = await axios.get(`${baseUrl}/api/rooms/${room_id}`);
            roomDetails = roomResponse.data;
        } catch (err) {
            if (err.response?.status === 404) {
                return res.status(404).json({ message: 'Room not found' });
            }
            return res.status(502).json({ message: 'Failed to reach room_service' });
        }

        // 1.5. Fetch System Config from room_service for payment settings
        let config = {};
        try {
            const configResponse = await axios.get(`${baseUrl}/api/config`);
            const configMap = configResponse.data;
            // The C# backend returns a dictionary directly, so config is already a map
            for (const key in configMap) {
                config[key] = configMap[key];
            }
        } catch (err) {
            console.warn('Warning: Could not fetch system config from room_service:', err.message);
        }

        // Priority: Room Config > Global Config
        const payment_option = roomDetails.payment_option || config['payment_option'] || 'pay_now';
        const deposit_percentage =
            roomDetails.deposit_percentage !== null && roomDetails.deposit_percentage !== undefined
                ? parseFloat(roomDetails.deposit_percentage)
                : parseFloat(config['deposit_percentage']) || 50;

        // 2. Format dates and validate order
        const inDate = new Date(check_in);
        const outDate = new Date(check_out);

        if (inDate >= outDate) {
            return res.status(400).json({ message: 'check_out must be after check_in' });
        }

        // 2.5. Check if any holiday falls within the date range via room_service
        try {
            const holidayResponse = await axios.get(`${baseUrl}/api/holidays`);
            const holidays = holidayResponse.data;

            // Filter holidays that fall within [check_in, check_out)
            const conflictingHoliday = holidays.find((h) => {
                const hDate = new Date(h.holiday_date);
                return hDate >= inDate && hDate < outDate;
            });

            if (conflictingHoliday) {
                return res.status(409).json({
                    message: 'Cannot book: Dates include a homestay holiday/closure',
                });
            }
        } catch (err) {
            console.warn('Warning: Could not fetch holidays from room_service:', err.message);
        }

        // 3. Check for overlapping bookings in booking_db
        const overlap = await prisma.booking.findFirst({
            where: {
                room_id: parseInt(room_id),
                AND: [
                    { check_in: { lt: new Date(check_out) } },
                    { check_out: { gt: new Date(check_in) } },
                ],
            },
        });

        if (overlap) {
            return res.status(409).json({ message: 'Room is not available for requested dates' });
        }

        // 4. Calculate total price
        const days = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
        const total_price = roomDetails.price * days;
        const payment_type = payment_option;

        // 5. Create booking record
        const newBooking = await prisma.booking.create({
            data: {
                room_id: parseInt(room_id),
                customer_id: parseInt(customer_id),
                customer_name,
                check_in: new Date(check_in),
                check_out: new Date(check_out),
                total_price,
                payment_type,
                payment_status: 'pending',
                created_at: new Date(),
            },
        });

        // Include deposit_percentage in the response when payment type is deposit
        const responseData = { ...newBooking };
        if (payment_type === 'deposit') {
            responseData.deposit_percentage = deposit_percentage;
        }

        res.status(201).json(responseData);
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/bookings
// Admin: get all bookings enriched with room_name from room_service
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            orderBy: { created_at: 'desc' },
        });

        // Enrich each booking with room_name from room_service
        const baseUrl = getRoomServiceUrl();
        const enriched = await Promise.all(
            bookings.map(async (b) => {
                try {
                    const roomResponse = await axios.get(`${baseUrl}/api/rooms/${b.room_id}`);
                    return { ...b, room_name: roomResponse.data.name };
                } catch {
                    // Return booking without room_name if room_service is unavailable
                    return { ...b, room_name: null };
                }
            })
        );

        res.json(enriched);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/bookings/me
// Customer / Admin: get own bookings with room info
// ─────────────────────────────────────────────────────────────────────────────
exports.getMyBookings = async (req, res) => {
    const customer_id = req.user.userId;
    try {
        const bookings = await prisma.booking.findMany({
            where: { customer_id: parseInt(customer_id) },
            orderBy: { check_in: 'desc' },
        });

        // Enrich with room info (name, price, first image) from room_service
        const baseUrl = getRoomServiceUrl();
        const enriched = await Promise.all(
            bookings.map(async (b) => {
                try {
                    const roomResponse = await axios.get(`${baseUrl}/api/rooms/${b.room_id}`);
                    const room = roomResponse.data;
                    const room_image =
                        Array.isArray(room.images) && room.images.length > 0
                            ? room.images[0]
                            : null;
                    return {
                        ...b,
                        room_name: room.name,
                        price: room.price,
                        room_image,
                    };
                } catch {
                    return { ...b, room_name: null, price: null, room_image: null };
                }
            })
        );

        res.json(enriched);
    } catch (error) {
        console.error('Error fetching my bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/bookings/rooms/:roomId
// Public: get all bookings for a specific room (useful for frontend calendar)
// ─────────────────────────────────────────────────────────────────────────────
exports.getBookingsByRoom = async (req, res) => {
    const { roomId } = req.params;
    try {
        const bookings = await prisma.booking.findMany({
            where: { room_id: parseInt(roomId) },
        });
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching room bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/bookings/:id
// Customer or Admin: delete a booking (customer can only delete their own)
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteBooking = async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: parseInt(id) },
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only admin or the booking owner can delete
        if (user.role === 'customer' && booking.customer_id !== user.userId) {
            return res.status(403).json({ message: 'Unauthorized to delete this booking' });
        }

        await prisma.booking.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/bookings/:id
// Admin only: update payment_status, check_in, or check_out
// ─────────────────────────────────────────────────────────────────────────────
exports.updateBooking = async (req, res) => {
    const { id } = req.params;
    const { payment_status, check_in, check_out } = req.body;

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: parseInt(id) },
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Build update payload with only provided fields (COALESCE equivalent)
        const updateData = {};
        if (payment_status !== undefined) updateData.payment_status = payment_status;
        if (check_in !== undefined) updateData.check_in = new Date(check_in);
        if (check_out !== undefined) updateData.check_out = new Date(check_out);

        const updated = await prisma.booking.update({
            where: { id: parseInt(id) },
            data: updateData,
        });

        res.json(updated);
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/bookings/unavailable-rooms?checkin=...&checkout=...
// Public: get room IDs that have bookings overlapping the given date range
// ─────────────────────────────────────────────────────────────────────────────
exports.getUnavailableRooms = async (req, res) => {
    const { checkin, checkout } = req.query;

    if (!checkin || !checkout) {
        return res.status(400).json({ message: 'checkin and checkout are required' });
    }

    try {
        // Find all bookings that overlap the requested date range
        const bookings = await prisma.booking.findMany({
            where: {
                AND: [
                    { check_in: { lt: new Date(checkout) } },
                    { check_out: { gt: new Date(checkin) } },
                ],
            },
            select: { room_id: true },
        });

        // Return distinct room IDs
        const roomIds = [...new Set(bookings.map((b) => b.room_id))];
        res.json(roomIds);
    } catch (error) {
        console.error('Error fetching unavailable rooms:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
