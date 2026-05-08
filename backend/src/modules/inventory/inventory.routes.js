const express = require('express');
const inventoryController = require('./inventory.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', inventoryController.getParts);
router.post('/', inventoryController.addPart);
router.put('/:id', inventoryController.updatePart);
router.delete('/:id', inventoryController.deletePart);

router.get('/movements', inventoryController.getMovements);
router.post('/movement', inventoryController.addMovement);

module.exports = router;
