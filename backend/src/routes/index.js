const express = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const customerRoutes = require('../modules/customers/customers.routes');
const financeRoutes = require('../modules/finances/finances.routes');
const inventoryRoutes = require('../modules/inventory/inventory.routes');
const orderRoutes = require('../modules/orders/orders.routes');
const settingsRoutes = require('../modules/settings/settings.routes');
const fleetRoutes = require('../modules/fleet/fleet.routes');
const auditRoutes = require('../modules/audit/audit.routes');
const travelRoutes = require('../modules/travels/travels.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/finances', financeRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/orders', orderRoutes);
router.use('/settings', settingsRoutes);
router.use('/fleet', fleetRoutes);
router.use('/audit', auditRoutes);
router.use('/travels', travelRoutes);


module.exports = router;
