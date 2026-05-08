const express = require('express');
const fleetController = require('./fleet.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/', authenticate, fleetController.getAll);
router.post('/', authenticate, fleetController.create);
router.put('/:id', authenticate, fleetController.update);
router.delete('/:id', authenticate, fleetController.remove);

module.exports = router;
