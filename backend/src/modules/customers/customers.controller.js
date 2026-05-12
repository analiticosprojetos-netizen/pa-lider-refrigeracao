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

const deleteCustomer = async (req, res, next) => {
  try {
    console.log('Tentando excluir cliente ID:', req.params.id);
    const result = await customerService.deleteCustomer(req.params.id);
    console.log('Resultado da exclusão:', result);
    
    if (result.affectedRows === 0) {
      console.warn('Nenhum cliente encontrado com este ID');
      return res.status(404).json({ success: false, message: 'Cliente não encontrado' });
    }

    console.log('Cliente excluído com sucesso');
    res.status(200).json({ success: true, message: 'Cliente excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    next(error);
  }
};

module.exports = {
  getCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer
};
