const express = require('express');
const customerController = require('./customers.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', customerController.getCustomers);
router.post('/', customerController.addCustomer);
router.put('/:id', customerController.updateCustomer);

module.exports = router;
