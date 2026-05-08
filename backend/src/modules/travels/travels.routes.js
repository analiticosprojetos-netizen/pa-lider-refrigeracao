const express = require('express');
const router = express.Router();
const travelsController = require('./travels.controller');
const { authenticate } = require('../../middlewares/auth.middleware');


// Trips
router.get('/trips', authenticate, travelsController.getTrips);
router.get('/trips/active', authenticate, travelsController.getActiveTrip);
router.post('/trips', authenticate, travelsController.createTrip);
router.put('/trips/:id', authenticate, travelsController.updateTrip);
router.delete('/trips/:id', authenticate, travelsController.deleteTrip);

// Simulations
router.get('/simulations', authenticate, travelsController.getSimulations);
router.post('/simulations', authenticate, travelsController.createSimulation);
router.delete('/simulations/:id', authenticate, travelsController.deleteSimulation);


module.exports = router;
