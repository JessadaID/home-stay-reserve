const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const sqlPath = path.join(__dirname, '../../main.sql');

const pool = new Pool({
    user: process.env.DB_USER || 'username',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'my_app_db',
    password: process.env.DB_PASSWORD || 'your_password',
    port: process.env.DB_PORT || 5432,
});

let isDbInitialized = false;

async function initDb() {
    if (!isDbInitialized) {
        try {
            const res = await pool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'admin'
                );
            `);

            const tableExists = res.rows[0].exists;

            if (!tableExists) {
                console.log('Initializing database tables from main.sql...');
                const sqlSchema = fs.readFileSync(sqlPath, 'utf8');
                await pool.query(sqlSchema);
                console.log('Database tables initialized successfully.');
            }

            isDbInitialized = true;
            console.log('Connected to PostgreSQL database');
        } catch (err) {
            console.error('Database initialization error:', err);
            throw err;
        }
    }
}

module.exports = {
    query: async (text, params = []) => {
        await initDb();

        try {
            const result = await pool.query(text, params);

            return {
                rows: result.rows,
                rowCount: result.rowCount
            };
        } catch (err) {
            console.error('Query Error:', err);
            throw err;
        }
    }
};