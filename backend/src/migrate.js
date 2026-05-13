require('dotenv').config();
const db = require('./config/db');

async function migrate() {
  try {
    console.log('Adding siteUrl column to site_settings...');
    await db.execute('ALTER TABLE site_settings ADD COLUMN siteUrl VARCHAR(255) DEFAULT "https://liderrefrigeracao.com.br"');
    console.log('Column added successfully!');
    process.exit(0);
  } catch (e) {
    if (e.code === 'ER_DUP_COLUMN_NAME') {
      console.log('Column already exists.');
      process.exit(0);
    }
    console.error('Migration failed:', e);
    process.exit(1);
  }
}

migrate();
