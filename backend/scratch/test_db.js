const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
  console.log('Connecting to:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    console.log('Successfully connected!');
    const [rows] = await connection.execute('SELECT 1');
    console.log('Query result:', rows);
    await connection.end();
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

test();
