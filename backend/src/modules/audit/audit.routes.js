const express = require('express');
const router = express.Router();
const auditController = require('./audit.controller');
const { authenticate } = require('../../middlewares/auth.middleware');


router.get('/', authenticate, auditController.getLogs);
router.post('/', authenticate, auditController.addLog);


module.exports = router;
