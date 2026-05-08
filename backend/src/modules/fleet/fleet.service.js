const db = require('../../config/db');

const getAll = async () => {
  const [rows] = await db.execute('SELECT * FROM fleet');
  return rows;
};

const create = async (data) => {
  const { id, placa, modelo, consumo } = data;
  await db.execute(
    'INSERT INTO fleet (id, placa, modelo, consumo) VALUES (?, ?, ?, ?)',
    [id, placa, modelo, consumo]
  );
  return { id, placa, modelo, consumo };
};

const update = async (id, data) => {
  const { placa, modelo, consumo } = data;
  await db.execute(
    'UPDATE fleet SET placa = ?, modelo = ?, consumo = ? WHERE id = ?',
    [placa, modelo, consumo, id]
  );
  return { id, placa, modelo, consumo };
};

const remove = async (id) => {
  await db.execute('DELETE FROM fleet WHERE id = ?', [id]);
  return { id };
};

module.exports = {
  getAll,
  create,
  update,
  remove
};
