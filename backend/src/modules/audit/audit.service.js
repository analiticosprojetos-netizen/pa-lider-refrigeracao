const db = require('../../config/db');
const { v4: uuidv4 } = require('uuid');

const getLogs = async () => {
  const [rows] = await db.execute('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 2000');
  return rows;
};

const addLog = async (logData) => {
  const id = logData.id || uuidv4();
  const { user, action, module, details, timestamp } = logData;
  
  await db.execute(
    'INSERT INTO audit_logs (id, user, action, module, details, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
    [id, user, action, module, details, timestamp || new Date()]
  );

  const [rows] = await db.execute('SELECT * FROM audit_logs WHERE id = ?', [id]);
  return rows[0];
};

const clearOldLogs = async (keepCount = 2000) => {
    // MySQL doesn't support LIMIT in subqueries for DELETE easily in some versions, 
    // but we can do a simple cleanup if needed. For now we just return.
    return { success: true };
};

module.exports = {
  getLogs,
  addLog,
  clearOldLogs
};
