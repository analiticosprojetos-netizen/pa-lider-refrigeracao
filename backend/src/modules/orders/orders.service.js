const db = require('../../config/db');

const getOrders = async () => {
  const [rows] = await db.execute('SELECT * FROM service_orders ORDER BY createdAt DESC');
  return rows.map(row => ({
    ...row,
    services: row.services || [],
    parts: row.parts || [],
    total: Number(row.total),
    subtotal: Number(row.subtotal),
    partsValue: Number(row.partsValue),
    servicesValue: Number(row.servicesValue),
    travelValue: Number(row.travelValue),
    discountValue: Number(row.discountValue),
    discountPercent: Number(row.discountPercent)
  }));
};

const createOrder = async (orderData) => {
  const {
    date, clientName, document, phone, email, plate, vehicleModel, equipBrand, equipModel,
    serviceType, problem, diagnosis, startTime, endTime, travelValue, discountPercent, discountValue,
    warranty, technician, observations, status, services, parts, partsValue, servicesValue,
    subtotal, total, origin, report
  } = orderData;
  
  const now = new Date();
  const datePrefix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  
  // Busca o último pedido do dia
  const [lastOrders] = await db.execute('SELECT id FROM service_orders WHERE id LIKE ? ORDER BY id DESC LIMIT 1', [`${datePrefix} - %`]);
  
  let nextNum = 1;
  if (lastOrders.length > 0) {
    const lastId = lastOrders[0].id;
    const partsArr = lastId.split(' - ');
    if (partsArr.length > 1) {
      nextNum = parseInt(partsArr[1]) + 1;
    }
  }
  
  const id = `${datePrefix} - ${nextNum}`;
  
  await db.execute(
    `INSERT INTO service_orders (
      id, date, clientName, document, phone, email, plate, vehicleModel, equipBrand, equipModel,
      serviceType, problem, diagnosis, startTime, endTime, travelValue, discountPercent, discountValue,
      warranty, technician, observations, status, services, parts, partsValue, servicesValue,
      subtotal, total, origin, report
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?
    )`,
    [
      id, date || null, clientName || null, document || null, phone || null, email || null, plate || null, vehicleModel || null, equipBrand || null, equipModel || null,
      serviceType || null, problem || null, diagnosis || null, startTime || null, endTime || null, travelValue || 0, discountPercent || 0, discountValue || 0,
      warranty || null, technician || null, observations || null, status || 'Pendente', 
      services ? JSON.stringify(services) : '[]', 
      parts ? JSON.stringify(parts) : '[]', 
      partsValue || 0, servicesValue || 0, subtotal || 0, total || 0, origin || null, report || null
    ]
  );

  const [rows] = await db.execute('SELECT * FROM service_orders WHERE id = ?', [id]);
  const row = rows[0];
  return {
    ...row,
    services: row.services || [],
    parts: row.parts || [],
    total: Number(row.total)
  };
};

const updateOrder = async (id, updates) => {
  const fields = [];
  const values = [];

  console.log(`[DEBUG] Updating order ${id} with:`, updates);
  for (const [key, value] of Object.entries(updates)) {

    if (key !== 'id' && key !== 'createdAt') {
      fields.push(`${key} = ?`);
      if (key === 'services' || key === 'parts') {
        values.push(JSON.stringify(value));
      } else {
        values.push(value);
      }
    }
  }

  if (fields.length > 0) {
    values.push(id);
    const query = `UPDATE service_orders SET ${fields.join(', ')} WHERE id = ?`;
    await db.execute(query, values);
  }

  const [rows] = await db.execute('SELECT * FROM service_orders WHERE id = ?', [id]);
  const row = rows[0];
  return {
    ...row,
    services: row.services || [],
    parts: row.parts || [],
    total: Number(row.total)
  };
};

const updateOrderStatus = async (id, status) => {
  let executedAt = null;
  let cancelledAt = null;

  if (status === 'Executado') {
    executedAt = new Date().toISOString().slice(0, 19).replace('T', ' '); // Formato MySQL datetime
  } else if (status === 'Cancelado') {
    cancelledAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  }

  await db.execute(
    'UPDATE service_orders SET status = ?, executedAt = ?, cancelledAt = ? WHERE id = ?',
    [status, executedAt, cancelledAt, id]
  );
  return true;
};

const deleteOrder = async (id) => {
  // Primeiro remove transações vinculadas para evitar erros de FK ou manter integridade
  await db.execute('DELETE FROM transactions WHERE orderId = ?', [id]);
  // Depois remove a OS
  const [result] = await db.execute('DELETE FROM service_orders WHERE id = ?', [id]);
  return result;
};

module.exports = {
  getOrders,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder
};
