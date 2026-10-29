const mysql = require('mysql2/promise');

// Konfigurasi koneksi MySQL (XAMPP / Laragon)
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

const DB_NAME = process.env.DB_NAME || 'userdb';

const pool = mysql.createPool({
  ...dbConfig,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
});

// Membuat database dan tabel jika belum ada, lalu mengisi data contoh
async function initDb() {
  const connection = await mysql.createConnection(dbConfig);
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  await connection.end();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM users');
  if (rows[0].total === 0) {
    await pool.query(`
      INSERT INTO users (name, email) VALUES
        ('Budi Santoso', 'budi@example.com'),
        ('Siti Aminah', 'siti@example.com')
    `);
  }
}

module.exports = { pool, initDb, dbConfig };
