const inventoryService = require('./inventory.service');

const getParts = async (req, res, next) => {
  try {
    const parts = await inventoryService.getParts();
    res.status(200).json({ success: true, data: parts });
  } catch (error) {
    next(error);
  }
};

const addPart = async (req, res, next) => {
  try {
    const newPart = await inventoryService.addPart(req.body);
    res.status(201).json({ success: true, data: newPart });
  } catch (error) {
    next(error);
  }
};

const updatePart = async (req, res, next) => {
  try {
    const updatedPart = await inventoryService.updatePart(req.params.id, req.body);
    res.status(200).json({ success: true, data: updatedPart });
  } catch (error) {
    next(error);
  }
};

const deletePart = async (req, res, next) => {
  try {
    await inventoryService.deletePart(req.params.id);
    res.status(200).json({ success: true, data: { message: 'Peça removida com sucesso' } });
  } catch (error) {
    next(error);
  }
};

const getMovements = async (req, res, next) => {
  try {
    const movements = await inventoryService.getMovements();
    res.status(200).json({ success: true, data: movements });
  } catch (error) {
    next(error);
  }
};

const addMovement = async (req, res, next) => {
  try {
    const newMovement = await inventoryService.addMovement(req.body);
    res.status(201).json({ success: true, data: newMovement });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getParts,
  addPart,
  updatePart,
  deletePart,
  getMovements,
  addMovement
};
