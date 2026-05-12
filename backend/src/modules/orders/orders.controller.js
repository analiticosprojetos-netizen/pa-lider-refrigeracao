const orderService = require('./orders.service');

const getOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getOrders();
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const newOrder = await orderService.createOrder(req.body);
    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const updatedOrder = await orderService.updateOrder(req.params.id, req.body);
    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    await orderService.updateOrderStatus(req.params.id, status);
    res.status(200).json({ success: true, data: { message: 'Status atualizado com sucesso' } });
  } catch (error) {
    next(error);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    console.log(`[DEBUG] Attempting to delete order: "${req.params.id}"`);
    const result = await orderService.deleteOrder(req.params.id);
    
    if (result.affectedRows === 0) {
      console.warn(`[WARN] No order found in database with ID: "${req.params.id}"`);
      return res.status(404).json({ success: false, error: 'Orçamento não encontrado no banco de dados' });
    }
    
    console.log(`[DEBUG] Successfully deleted order: "${req.params.id}"`);
    res.status(200).json({ success: true, data: { message: 'Orçamento excluído com sucesso' } });
  } catch (error) {
    console.error(`[ERROR] Failed to delete order "${req.params.id}":`, error);
    next(error);
  }
};

module.exports = {
  getOrders,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder
};
