// server/setupDb.js
const pool = require('./db');

async function setup() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        text VARCHAR(255),
        color VARCHAR(20) DEFAULT '#000000',
        fontSize VARCHAR(10) DEFAULT '14px',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database setup completed.');
    process.exit(0);
  } catch (err) {
    console.error('Error setting up database:', err);
    process.exit(1);
  }
}

setup();
