const db = require('../../config/db');
const { v4: uuidv4 } = require('uuid');

const getParts = async () => {
  const [rows] = await db.execute('SELECT * FROM inventory_parts');
  return rows;
};

const addPart = async (partData) => {
  const id = uuidv4();
  const { name, quantity } = partData;
  
  await db.execute(
    'INSERT INTO inventory_parts (id, name, quantity) VALUES (?, ?, ?)',
    [id, name, quantity || 0]
  );

  const [rows] = await db.execute('SELECT * FROM inventory_parts WHERE id = ?', [id]);
  return rows[0];
};

const updatePart = async (id, updates) => {
  const fields = [];
  const values = [];

  const allowedFields = ['name', 'quantity'];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length > 0) {
    values.push(id);
    const query = `UPDATE inventory_parts SET ${fields.join(', ')} WHERE id = ?`;
    await db.execute(query, values);
  }

  const [rows] = await db.execute('SELECT * FROM inventory_parts WHERE id = ?', [id]);
  return rows[0];
};

const deletePart = async (id) => {
  await db.execute('DELETE FROM inventory_parts WHERE id = ?', [id]);
  return true;
};

const getMovements = async () => {
  const [rows] = await db.execute('SELECT * FROM inventory_movements ORDER BY date DESC');
  return rows;
};

const addMovement = async (movementData) => {
  const id = uuidv4();
  const { partName, type, quantity, user, note } = movementData;
  
  await db.execute(
    'INSERT INTO inventory_movements (id, partName, type, quantity, user, note) VALUES (?, ?, ?, ?, ?, ?)',
    [id, partName, type, quantity, user || null, note || null]
  );

  // Se o usuário desejar que a movimentação altere a tabela de parts automaticamente,
  // poderíamos fazer aqui. Mas como o frontend chama as duas APIs separadamente ou apenas envia a movimentação
  // eu vou deixar simples por enquanto.
  
  const [rows] = await db.execute('SELECT * FROM inventory_movements WHERE id = ?', [id]);
  return rows[0];
};

module.exports = {
  getParts,
  addPart,
  updatePart,
  deletePart,
  getMovements,
  addMovement
};
