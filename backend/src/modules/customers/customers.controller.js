const customerService = require('./customers.service');

const getCustomers = async (req, res, next) => {
  try {
    const customers = await customerService.getCustomers();
    res.status(200).json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
};

const addCustomer = async (req, res, next) => {
  try {
    const newCustomer = await customerService.addCustomer(req.body);
    res.status(201).json({ success: true, data: newCustomer });
  } catch (error) {
    next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const updatedCustomer = await customerService.updateCustomer(req.params.id, req.body);
    res.status(200).json({ success: true, data: updatedCustomer });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  addCustomer,
  updateCustomer
};
