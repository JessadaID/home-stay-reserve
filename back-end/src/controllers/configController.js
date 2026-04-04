const db = require('../config/db');

exports.getConfig = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM "System_Config"');
        const configMap = {};
        for (let row of result.rows) {
            configMap[row.config_key] = row.config_value;
        }
        res.json(configMap);
    } catch (error) {
        console.error('Error fetching config:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateConfig = async (req, res) => {
    const { payment_option, deposit_percentage } = req.body;
    try {
        if (payment_option) {
            await db.query('UPDATE "System_Config" SET config_value = $1 WHERE config_key = $2', [payment_option, 'payment_option']);
        }
        if (deposit_percentage) {
            await db.query('UPDATE "System_Config" SET config_value = $1 WHERE config_key = $2', [deposit_percentage, 'deposit_percentage']);
        }
        res.json({ message: 'Configuration updated' });
    } catch (error) {
        console.error('Error updating config:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
