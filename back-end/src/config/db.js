const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../homestay.db');
const sqlPath = path.join(__dirname, '../../main.sql');

let dbInstance = null;

async function initDb() {
    if (!dbInstance) {
        dbInstance = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        // Enable foreign keys
        await dbInstance.exec('PRAGMA foreign_keys = ON;');
        console.log('Connected to SQLite database');

        // Simple check if tables exist, if not, initialize from main.sql
        const check = await dbInstance.get("SELECT name FROM sqlite_master WHERE type='table' AND name='Admin'");
        if (!check) {
            console.log('Initializing database tables from main.sql...');
            const sqlSchema = fs.readFileSync(sqlPath, 'utf8');
            await dbInstance.exec(sqlSchema);
            console.log('Database tables initialized successfully.');
        }
    }
    return dbInstance;
}

// Wrapper to mimic pg's query interface
module.exports = {
    query: async (text, params = []) => {
        const db = await initDb();

        // PostgreSQL uses $1, $2, etc. SQLite uses ?, ? natively
        const sqliteText = text.replace(/\$\d+/g, '?');

        // If it's a SELECT statement or uses RETURNING, we want rows back
        if (sqliteText.trim().toUpperCase().startsWith('SELECT') || sqliteText.toUpperCase().includes('RETURNING')) {
            const rows = await db.all(sqliteText, params);
            return { rows };
        } else {
            const result = await db.run(sqliteText, params);
            return { rows: [], rowCount: result.changes, lastID: result.lastID };
        }
    }
};
