require('dotenv').config();
const db = require('./config/db');

async function migrate() {
  try {
    console.log('Adding SEO columns to site_settings...');
    
    // Add columns if they don't exist
    const columns = [
      'ALTER TABLE site_settings ADD COLUMN seoTitle VARCHAR(255) DEFAULT "Lider Refrigeração - Peças e Serviços para Transporte"',
      'ALTER TABLE site_settings ADD COLUMN seoDescription TEXT',
      'ALTER TABLE site_settings ADD COLUMN seoKeywords TEXT'
    ];

    for (const sql of columns) {
      try {
        await db.execute(sql);
      } catch (e) {
        if (e.code !== 'ER_DUP_COLUMN_NAME') console.warn('Warning:', e.message);
      }
    }

    // Update siteUrl to the new official domain if it was the default one
    await db.execute('UPDATE site_settings SET siteUrl = "https://oficinaliderrefrigeracao.com.br" WHERE siteUrl = "https://liderrefrigeracao.com.br" OR siteUrl IS NULL');
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (e) {
    console.error('Migration failed:', e);
    process.exit(1);
  }
}

migrate();
