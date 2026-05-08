const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function fix() {
  const hash = await bcrypt.hash('1234', 10);
  console.log('New Hash:', hash);
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'lider_refrigeracao',
    port: 3306
  });
  await conn.execute('UPDATE users SET password = ? WHERE id = ?', [hash, '1']);
  console.log('Update successful');
  await conn.end();
}

fix().catch(console.error);
