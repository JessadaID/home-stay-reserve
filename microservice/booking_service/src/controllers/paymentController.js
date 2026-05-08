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
        const booking = await prisma.booking.findFirst({
            where: {
                id: parseInt(booking_id),
                customer_id: parseInt(customer_id),
            },
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found or not authorized' });
        }

        let newStatus = 'paid';
        if (booking.payment_type === 'deposit') {
            newStatus = 'deposit_paid';
        }

        const updatedBooking = await prisma.booking.update({
            where: {
                id: parseInt(booking_id),
            },
            data: {
                payment_status: newStatus,
            },
        });

        res.json({ message: 'Payment successful', booking: updatedBooking });
    } catch (error) {
        console.error('Error mocking payment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
