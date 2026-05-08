// src/server.js
// Entry point for booking_service Express application

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'booking_service', port: process.env.PORT || 3003 });
});

// Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
    console.log(`Booking Service is running on port ${PORT}`);
});
