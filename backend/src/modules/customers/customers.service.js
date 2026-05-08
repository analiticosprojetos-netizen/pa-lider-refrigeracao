const db = require('../../config/db');
const { v4: uuidv4 } = require('uuid');

const getCustomers = async () => {
  const [rows] = await db.execute('SELECT * FROM customers ORDER BY created_at DESC');
  return rows;
};

const addCustomer = async (customerData) => {
  const id = uuidv4();
  const { name, document, phone, email, plate, vehicleModel, equipBrand, equipModel } = customerData;
  
  await db.execute(
    'INSERT INTO customers (id, name, document, phone, email, plate, vehicleModel, equipBrand, equipModel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, name, document || null, phone || null, email || null, plate || null, vehicleModel || null, equipBrand || null, equipModel || null]
  );

  const [rows] = await db.execute('SELECT * FROM customers WHERE id = ?', [id]);
  return rows[0];
};

const updateCustomer = async (id, updates) => {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (key !== 'id' && key !== 'created_at') {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) return { id, ...updates };

  values.push(id);
  const query = `UPDATE customers SET ${fields.join(', ')} WHERE id = ?`;
  await db.execute(query, values);

  const [rows] = await db.execute('SELECT * FROM customers WHERE id = ?', [id]);
  return rows[0];
};

module.exports = {
  getCustomers,
  addCustomer,
  updateCustomer
};
