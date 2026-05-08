const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

exports.mockPayment = async (req, res) => {
    const { booking_id } = req.body;
    const customer_id = req.user.userId;

    if (!booking_id) {
        return res.status(400).json({ message: 'Booking ID is required' });
    }

    try {
        // 1. Check if booking exists and belongs to the customer
        const bookingCheck = await prisma.booking.findFirst({
            where: {
                id: parseInt(booking_id),
                customer_id: parseInt(customer_id),
            },
        });
        if (bookingCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found or not authorized' });
        }

        const booking = bookingCheck.rows[0];

        // 2. Logic: if 'pay_now' -> 'paid', if 'deposit' -> 'deposit_paid'
        let newStatus = 'paid';
        if (booking.payment_type === 'deposit') {
            newStatus = 'deposit_paid';
        }

        // 3. Update status in Database
        const result = await prisma.booking.update({
            where: {
                id: parseInt(booking_id),
            },
            data: {
                payment_status: newStatus,
            },
        });

        res.json({ message: 'Payment successful', booking: result.rows[0] });
    } catch (error) {
        console.error('Error mocking payment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
