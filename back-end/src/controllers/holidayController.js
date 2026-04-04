const db = require('../config/db');

exports.getHolidays = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM "Holiday" ORDER BY holiday_date ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching holidays:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addHoliday = async (req, res) => {
    const { holiday_date, description } = req.body;

    if (!holiday_date) {
        return res.status(400).json({ message: 'holiday_date is required' });
    }

    try {
        const existCheck = await db.query('SELECT id FROM "Holiday" WHERE holiday_date = $1', [holiday_date]);
        if (existCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Holiday already exists for this date' });
        }

        const result = await db.query(
            'INSERT INTO "Holiday" (holiday_date, description) VALUES ($1, $2) RETURNING *',
            [holiday_date, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding holiday:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteHoliday = async (req, res) => {
    const { id } = req.params;

    try {
        const check = await db.query('SELECT id FROM "Holiday" WHERE id = $1', [id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Holiday not found' });
        }

        await db.query('DELETE FROM "Holiday" WHERE id = $1', [id]);
        res.json({ message: 'Holiday removed successfully' });
    } catch (error) {
        console.error('Error deleting holiday:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
