const db = require('../config/db');

exports.createBooking = async (req, res) => {
    const { room_id, customer_name, check_in, check_out } = req.body;
    const customer_id = req.user.userId;

    if (!room_id || !customer_name || !check_in || !check_out) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // 1. Check if room exists
        const roomQuery = `SELECT * FROM "Room" WHERE id = $1`;
        const roomCheck = await db.query(roomQuery, [room_id]);
        if (roomCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }
        const roomDetails = roomCheck.rows[0];

        // 1.5 Fetch System Config for payments
        const configResult = await db.query('SELECT * FROM "System_Config"');
        const config = {};
        for (let row of configResult.rows) config[row.config_key] = row.config_value;

        // Priority: Room Config > Global Config
        const payment_option = roomDetails.payment_option || config['payment_option'] || 'pay_now';
        const deposit_percentage = (roomDetails.deposit_percentage !== null && roomDetails.deposit_percentage !== undefined)
            ? parseFloat(roomDetails.deposit_percentage)
            : (parseFloat(config['deposit_percentage']) || 50);

        // 2. Format dates and check validity
        const inDate = new Date(check_in);
        const outDate = new Date(check_out);

        if (inDate >= outDate) {
            return res.status(400).json({ message: 'check_out must be after check_in' });
        }

        // 2.5. Check if holiday is active
        const holidaysQuery = `
            SELECT holiday_date FROM "Holiday" 
            WHERE holiday_date >= $1 AND holiday_date < $2
        `;
        const holidaysCheck = await db.query(holidaysQuery, [check_in, check_out]);
        if (holidaysCheck.rows.length > 0) {
            return res.status(409).json({ message: 'Cannot book: Dates include a homestay holiday/closure' });
        }

        // 3. Check for overlapping bookings
        const overlapQuery = `
      SELECT id FROM "Booking" 
      WHERE room_id = $1 
      AND (
        (check_in <= $2 AND check_out > $2) OR 
        (check_in < $3 AND check_out >= $3) OR
        ($2 <= check_in AND $3 >= check_out)
      )
    `;
        const overlap = await db.query(overlapQuery, [room_id, check_in, check_out]);

        if (overlap.rows.length > 0) {
            return res.status(409).json({ message: 'Room is not available for requested dates' });
        }

        // 4. Calculate total price and save payment type
        const days = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
        const total_price = roomDetails.price * days;
        const payment_type = payment_option;

        // 5. Create booking with timestamp and payment details
        const createdAt = new Date().toISOString();
        const result = await db.query(
            'INSERT INTO "Booking" (room_id, customer_id, customer_name, check_in, check_out, total_price, payment_type, payment_status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [room_id, customer_id, customer_name, check_in, check_out, total_price, payment_type, 'pending', createdAt]
        );

        // Include deposit_percentage in the response if deposit
        const newBooking = result.rows[0];
        if (payment_type === 'deposit') {
            newBooking.deposit_percentage = deposit_percentage;
        }

        res.status(201).json(newBooking);
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        // Admin can see all bookings with room name
        const query = `
            SELECT b.*, r.name as room_name 
            FROM "Booking" b
            JOIN "Room" r ON b.room_id = r.id
            ORDER BY b.created_at DESC
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMyBookings = async (req, res) => {
    const customer_id = req.user.userId;
    try {
        // Fetch bookings with room info and the first image via subquery
        const query = `
            SELECT b.*, 
                   r.name as room_name, 
                   r.price,
                   (CASE 
                       WHEN r.images IS NOT NULL AND r.images != '' 
                       THEN (JSON_EXTRACT_PATH_TEXT(r.images::json, '0'))
                       ELSE NULL 
                    END) as room_image
            FROM "Booking" b
            JOIN "Room" r ON b.room_id = r.id
            WHERE b.customer_id = $1
            ORDER BY b.check_in DESC
        `;
        const result = await db.query(query, [customer_id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching my bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getBookingsByRoom = async (req, res) => {
    const { roomId } = req.params;
    try {
        const result = await db.query('SELECT * FROM "Booking" WHERE room_id = $1', [roomId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching room bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteBooking = async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    try {
        const check = await db.query('SELECT * FROM "Booking" WHERE id = $1', [id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const booking = check.rows[0];

        // Only Admin or the Customer who booked can delete
        if (user.role === 'customer' && booking.customer_id !== user.userId) {
            return res.status(403).json({ message: 'Unauthorized to delete this booking' });
        }

        await db.query('DELETE FROM "Booking" WHERE id = $1', [id]);
        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateBooking = async (req, res) => {
    const { id } = req.params;
    const { payment_status, check_in, check_out } = req.body;

    try {
        const check = await db.query('SELECT * FROM "Booking" WHERE id = $1', [id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const result = await db.query(
            `UPDATE "Booking" 
             SET payment_status = COALESCE($1, payment_status),
                 check_in = COALESCE($2, check_in),
                 check_out = COALESCE($3, check_out)
             WHERE id = $4 RETURNING *`,
            [payment_status, check_in, check_out, id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
