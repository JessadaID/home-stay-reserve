const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

// Admin - View all bookings
router.get('/', authMiddleware(['admin']), bookingController.getAllBookings);

// Customer / Admin - View own bookings
router.get('/me', authMiddleware(['customer', 'admin']), bookingController.getMyBookings);

// Get bookings by room id (public/useful for frontend calendar)
router.get('/rooms/:roomId', bookingController.getBookingsByRoom);

// Customer / Admin - Create booking
router.post('/', authMiddleware(['customer', 'admin']), bookingController.createBooking);

// Customer/Admin - Delete booking
router.delete('/:id', authMiddleware(['customer', 'admin']), bookingController.deleteBooking);

// Admin - Update booking
router.put('/:id', authMiddleware(['admin']), bookingController.updateBooking);

module.exports = router;
