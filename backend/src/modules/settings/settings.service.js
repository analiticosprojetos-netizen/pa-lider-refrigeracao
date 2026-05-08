const db = require('../../config/db');

const getSettings = async () => {
  const [rows] = await db.execute('SELECT * FROM site_settings WHERE id = 1');
  if (rows.length === 0) {
    await db.execute('INSERT INTO site_settings (id, banners, specialties) VALUES (1, "[]", "[]")');
    return { id: 1, banners: [], specialties: [], carouselDelay: 6, goalType: 'valor', goalTarget: 5000 };
  }
  const settings = rows[0];
  return {
    ...settings,
    banners: JSON.parse(settings.banners || '[]'),
    specialties: JSON.parse(settings.specialties || '[]')
  };
};

const updateSettings = async (data) => {
  const fields = Object.keys(data).filter(key => key !== 'id');
  if (fields.length === 0) return getSettings();

  const sets = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => {
    if (field === 'banners' || field === 'specialties') {
      return JSON.stringify(data[field] || []);
    }
    return data[field];
  });

  const query = `UPDATE site_settings SET ${sets} WHERE id = 1`;
  await db.execute(query, values);
  
  return getSettings();
};

module.exports = {
  getSettings,
  updateSettings
};
