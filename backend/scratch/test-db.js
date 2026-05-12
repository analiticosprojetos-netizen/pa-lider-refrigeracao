const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'lider_refrigeracao',
    });
    const [rows] = await pool.query('SELECT 1');
    console.log('Database connection successful!');
    await pool.end();
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
}

testConnection();
