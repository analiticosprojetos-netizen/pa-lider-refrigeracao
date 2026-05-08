const db = require('../../config/db');
const { v4: uuidv4 } = require('uuid');

// Trips (Real journeys)
const getTrips = async () => {
  const [rows] = await db.execute('SELECT * FROM trips ORDER BY created_at DESC');
  return rows;
};

const getActiveTrip = async () => {
  const [rows] = await db.execute("SELECT * FROM trips WHERE status = 'ativa' LIMIT 1");
  return rows[0] || null;
};

const createTrip = async (tripData) => {
  const id = uuidv4();
  const { status, origem, destino, placa, km_inicial, distancia, eventos, user_name } = tripData;
  
  await db.execute(
    'INSERT INTO trips (id, status, origem, destino, placa, km_inicial, distancia, eventos, user_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, status || 'ativa', origem, destino, placa, km_inicial, distancia, JSON.stringify(eventos || []), user_name || null]
  );

  const [rows] = await db.execute('SELECT * FROM trips WHERE id = ?', [id]);
  return rows[0];
};


const updateTrip = async (id, tripData) => {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(tripData)) {
    if (key !== 'id' && key !== 'created_at') {
      fields.push(`${key} = ?`);
      values.push(key === 'eventos' ? JSON.stringify(value) : value);
    }
  }

  if (fields.length === 0) return { id, ...tripData };

  values.push(id);
  const query = `UPDATE trips SET ${fields.join(', ')} WHERE id = ?`;
  await db.execute(query, values);

  const [rows] = await db.execute('SELECT * FROM trips WHERE id = ?', [id]);
  return rows[0];
};

const deleteTrip = async (id) => {
  await db.execute('DELETE FROM trips WHERE id = ?', [id]);
  return { success: true };
};

// Simulations (Freight calculations)
const getSimulations = async () => {
  const [rows] = await db.execute('SELECT * FROM simulations ORDER BY data DESC');
  return rows;
};

const createSimulation = async (simData) => {
  const id = uuidv4();
  const { 
    origem, destino, distancia_km, duracao_min, consumo, preco_diesel, 
    custo_combustivel, total_pedagios, valor_frete, custo_total, lucro, margem, custo_por_km, user_name 
  } = simData;
  
  await db.execute(
    `INSERT INTO simulations (
      id, origem, destino, distancia_km, duracao_min, consumo, preco_diesel, 
      custo_combustivel, total_pedagios, valor_frete, custo_total, lucro, margem, custo_por_km, user_name
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, origem, destino, distancia_km, duracao_min, consumo, preco_diesel, 
      custo_combustivel, total_pedagios, valor_frete, custo_total, lucro, margem, custo_por_km, user_name || null
    ]
  );


  const [rows] = await db.execute('SELECT * FROM simulations WHERE id = ?', [id]);
  return rows[0];
};

const deleteSimulation = async (id) => {
  await db.execute('DELETE FROM simulations WHERE id = ?', [id]);
  return { success: true };
};

module.exports = {
  getTrips,
  getActiveTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  getSimulations,
  createSimulation,
  deleteSimulation
};
