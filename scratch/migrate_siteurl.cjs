const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
const db = require('../backend/src/config/db');

async function migrate() {
  try {
    console.log('Adding siteUrl column to site_settings...');
    await db.execute('ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS siteUrl VARCHAR(255) DEFAULT "https://liderrefrigeracao.com.br"');
    console.log('Column added successfully!');
    process.exit(0);
  } catch (e) {
    console.error('Migration failed:', e);
    process.exit(1);
  }
}

migrate();
