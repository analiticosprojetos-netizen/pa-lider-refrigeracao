const express = require('express');
const financeController = require('./finances.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', financeController.getTransactions);
router.post('/', financeController.addTransaction);

module.exports = router;
