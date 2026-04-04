const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

// Route for mocking payment processing
router.post('/mock', authMiddleware(['customer', 'admin']), paymentController.mockPayment);

module.exports = router;
