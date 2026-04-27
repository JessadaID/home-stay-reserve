const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// --- Admin Authentication ---

exports.registerAdmin = async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
        return res.status(400).json({ message: 'Please provide username, password and email' });
    }

    try {
        const existing = await db.query('SELECT * FROM "Admin" WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await db.query(
            'INSERT INTO "Admin" (username, password, email) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, hashedPassword, email]
        );

        res.status(201).json({ message: 'Admin registered successfully', user: result.rows[0] });
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
        const result = await db.query('SELECT * FROM "Admin" WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const admin = result.rows[0];
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Record login
        await db.query('INSERT INTO "Login" (admin_id, login_time) VALUES ($1, $2)', [admin.id, new Date().toISOString()]);

        const payload = { userId: admin.id, id: admin.id, username: admin.username, email: admin.email, role: 'admin' };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ token, user: { id: admin.id, username: admin.username, email: admin.email, role: 'admin' } });
    } catch (error) {
        console.error('Error in loginAdmin:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Customer Authentication ---

exports.registerCustomer = async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
        return res.status(400).json({ message: 'Please provide username, password and email' });
    }

    try {
        const existing = await db.query('SELECT * FROM "Customer" WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await db.query(
            'INSERT INTO "Customer" (name, password, email) VALUES ($1, $2, $3) RETURNING id, name, email',
            [username, hashedPassword, email]
        );

        res.status(201).json({ message: 'Customer registered successfully', user: result.rows[0] });
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
        const result = await db.query('SELECT * FROM "Customer" WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const customer = result.rows[0];
        const isMatch = await bcrypt.compare(password, customer.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Record login
        await db.query('INSERT INTO "Login" (customer_id, login_time) VALUES ($1, $2)', [customer.id, new Date().toISOString()]);

        const payload = { userId: customer.id, id: customer.id, username: customer.username, email: customer.email, role: 'customer' };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ token, user: { id: customer.id, username: customer.username, email: customer.email, role: 'customer' } });
    } catch (error) {
        console.error('Error in loginCustomer:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
