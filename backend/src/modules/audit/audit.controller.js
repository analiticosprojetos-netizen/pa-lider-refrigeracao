const auditService = require('./audit.service');

const getLogs = async (req, res) => {
  try {
    const logs = await auditService.getLogs();
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addLog = async (req, res) => {
  try {
    const log = await auditService.addLog(req.body);
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getLogs,
  addLog
};
