const financeService = require('./finances.service');

const getTransactions = async (req, res, next) => {
  try {
    const transactions = await financeService.getTransactions();
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
};

const addTransaction = async (req, res, next) => {
  try {
    const newTransaction = await financeService.addTransaction(req.body);
    res.status(201).json({ success: true, data: newTransaction });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  addTransaction
};
