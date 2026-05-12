const db = require('../backend/src/config/db');

async function check() {
  try {
    const [rows] = await db.execute('SELECT id, clientName FROM service_orders');
    console.log('Orders in DB:', JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
