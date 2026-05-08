const express = require('express');
const settingsController = require('./settings.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/', settingsController.getSettings); // Público ou autenticado? Vou deixar público para o carrossel da home
router.put('/', authenticate, settingsController.updateSettings);

module.exports = router;
