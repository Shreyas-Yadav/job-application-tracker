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
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255),
        avatar_url TEXT,
        provider VARCHAR(50) NOT NULL,
        provider_account_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_provider_account (provider, provider_account_id)
      )
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS job_applications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        company VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        status ENUM('applied','interview','offer','rejected') DEFAULT 'applied',
        date_applied DATE,
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Add user_id column if table already exists without it
    const [cols] = await conn.execute(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'job_applications' AND COLUMN_NAME = 'user_id'`
    );
    if (cols.length === 0) {
      await conn.execute('ALTER TABLE job_applications ADD COLUMN user_id INT');
      await conn.execute('ALTER TABLE job_applications ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
    }

    console.log('Schema initialized');
  } finally {
    conn.release();
  }
}

module.exports = { pool, initSchema };
