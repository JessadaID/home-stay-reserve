const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// --- Admin Authentication ---

exports.registerAdmin = async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
        return res.status(400).json({ message: 'Please provide username, password and email' });
    }

    try {
        const existing = await prisma.admin.findUnique({
            where: { email }
        });
        if (existing) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = await prisma.admin.create({
            data: {
                username,
                password: hashedPassword,
                email
            }
        });

        // Don't return password
        const { password: _, ...adminWithoutPassword } = admin;
        res.status(201).json({ message: 'Admin registered successfully', user: adminWithoutPassword });
    } catch (error) {
        console.error('Error in registerAdmin:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    try {
        const admin = await prisma.admin.findUnique({
            where: { email }
        });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Record login
        await prisma.login.create({
            data: {
                admin_id: admin.id,
                login_time: new Date()
            }
        });

        const payload = { userId: admin.id, id: admin.id, username: admin.username, email: admin.email, role: 'admin' };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
            expiresIn: '1d',
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE
        });

        res.json({ token, user: { id: admin.id, username: admin.username, email: admin.email, role: 'admin' } });
    } catch (error) {
        console.error('Error in loginAdmin:', error);
        res.status(500).json({ message: error.message });
    }
};

// --- Customer Authentication ---

exports.registerCustomer = async (req, res) => {
    const { username, password, email } = req.body; // Original uses 'username' in body but 'name' in DB
    if (!username || !password || !email) {
        return res.status(400).json({ message: 'Please provide username, password and email' });
    }

    try {
        const existing = await prisma.customer.findUnique({
            where: { email }
        });
        if (existing) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const customer = await prisma.customer.create({
            data: {
                name: username,
                password: hashedPassword,
                email
            }
        });

        const { password: _, ...customerWithoutPassword } = customer;
        res.status(201).json({ message: 'Customer registered successfully', user: customerWithoutPassword });
    } catch (error) {
        console.error('Error in registerCustomer:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.loginCustomer = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    try {
        const customer = await prisma.customer.findUnique({
            where: { email }
        });
        if (!customer) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Record login
        await prisma.login.create({
            data: {
                customer_id: customer.id,
                login_time: new Date()
            }
        });

        const payload = { userId: customer.id, id: customer.id, username: customer.name, email: customer.email, role: 'customer' };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
            expiresIn: '1d',
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE
        });

        res.json({ token, user: { id: customer.id, username: customer.name, email: customer.email, role: 'customer' } });
    } catch (error) {
        console.error('Error in loginCustomer:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
