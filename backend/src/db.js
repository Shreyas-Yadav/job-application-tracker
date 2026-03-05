require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'jobtracker',
  user: process.env.DB_USER || 'jobuser',
  password: process.env.DB_PASSWORD || 'jobpassword',
  waitForConnections: true,
  connectionLimit: 10,
});

async function initSchema() {
  const conn = await pool.getConnection();
  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS job_applications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        company VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        status ENUM('applied','interview','offer','rejected') DEFAULT 'applied',
        date_applied DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Schema initialized');
  } finally {
    conn.release();
  }
}

module.exports = { pool, initSchema };
