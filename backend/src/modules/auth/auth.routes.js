const express = require('express');
const authController = require('./auth.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const { loginRateLimiter } = require('../../middlewares/rateLimit.middleware');

const router = express.Router();

router.post('/login', loginRateLimiter, authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);

// Rotas Administrativas - Apenas ADMIN
router.get('/users', authenticate, authorize(['ADMIN']), authController.getUsers);
router.post('/users', authenticate, authorize(['ADMIN']), authController.createUser);
router.put('/users/:id', authenticate, authorize(['ADMIN']), authController.updateUser);
router.delete('/users/:id', authenticate, authorize(['ADMIN']), authController.deleteUser);

router.get('/roles', authenticate, authorize(['ADMIN']), authController.getRoles);
router.post('/roles', authenticate, authorize(['ADMIN']), authController.createRole);
router.delete('/roles/:name', authenticate, authorize(['ADMIN']), authController.deleteRole);

module.exports = router;

