const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
const db = require('../backend/src/config/db');

async function testDelete() {
  try {
    const [rows] = await db.execute('SELECT id FROM service_orders LIMIT 1');
    if (rows.length === 0) {
      console.log('No orders found to test.');
      process.exit(0);
    }
    
    const id = rows[0].id;
    console.log(`Testing deletion of ID: "${id}"`);
    
    const [result] = await db.execute('DELETE FROM service_orders WHERE id = ?', [id]);
    console.log('Delete result:', result);
    
    process.exit(0);
  } catch (e) {
    console.error('Test failed:', e);
    process.exit(1);
  }
}

testDelete();
