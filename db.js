import pg from 'pg';
import 'dotenv/config'; // Automatically loads variables from .env

const { Pool } = pg;

// 1. Create the Pool
// The Pool reads the variables (DB_USER, DB_PASSWORD) from process.env automatically
// provided they match the standard names, or we pass them explicitly like this:
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

// 2. Test the Connection (Optional but Recommended)
// We run a simple query to ensure the "bridge" is working.
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database Connection Failed:', err);
    } else {
        console.log('✅ Connected to PostgreSQL Database');
    }
});

// 3. Export the Pool
// Now other files can just "import pool" and run queries immediately.
export default pool;