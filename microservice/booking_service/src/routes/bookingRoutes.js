// src/routes/bookingRoutes.js
// Defines all booking endpoints with authentication guards

const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

// Admin — view all bookings (enriched with room_name)
router.get('/', authMiddleware(['admin']), bookingController.getAllBookings);

// Customer / Admin — view own bookings
router.get('/me', authMiddleware(['customer', 'admin']), bookingController.getMyBookings);

// Public — get bookings by room id (for frontend calendar)
router.get('/rooms/:roomId', bookingController.getBookingsByRoom);

// Public — get unavailable room IDs for a date range
router.get('/unavailable-rooms', bookingController.getUnavailableRooms);

// Customer / Admin — create a booking
router.post('/', authMiddleware(['customer', 'admin']), bookingController.createBooking);

// Customer / Admin — delete a booking
router.delete('/:id', authMiddleware(['customer', 'admin']), bookingController.deleteBooking);

// Admin — update booking (payment_status, dates)
router.put('/:id', authMiddleware(['admin']), bookingController.updateBooking);

module.exports = router;
