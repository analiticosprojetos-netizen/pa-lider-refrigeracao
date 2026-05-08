const travelsService = require('./travels.service');

const getTrips = async (req, res) => {
  try {
    const trips = await travelsService.getTrips();
    res.json({ success: true, data: trips });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getActiveTrip = async (req, res) => {
  try {
    const trip = await travelsService.getActiveTrip();
    res.json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createTrip = async (req, res) => {
  try {
    const trip = await travelsService.createTrip(req.body);
    res.status(201).json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTrip = async (req, res) => {
  try {
    const trip = await travelsService.updateTrip(req.params.id, req.body);
    res.json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTrip = async (req, res) => {
  try {
    await travelsService.deleteTrip(req.params.id);
    res.json({ success: true, message: 'Viagem removida' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSimulations = async (req, res) => {
  try {
    const simulations = await travelsService.getSimulations();
    res.json({ success: true, data: simulations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createSimulation = async (req, res) => {
  try {
    const simulation = await travelsService.createSimulation(req.body);
    res.status(201).json({ success: true, data: simulation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSimulation = async (req, res) => {
  try {
    await travelsService.deleteSimulation(req.params.id);
    res.json({ success: true, message: 'Simulação removida' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTrips,
  getActiveTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  getSimulations,
  createSimulation,
  deleteSimulation
};
