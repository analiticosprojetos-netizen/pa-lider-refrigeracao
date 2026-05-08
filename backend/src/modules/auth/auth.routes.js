const express = require('express');
const authController = require('./auth.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.post('/login', authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);
router.get('/users', authenticate, authController.getUsers);
router.post('/users', authenticate, authController.createUser);
router.put('/users/:id', authenticate, authController.updateUser);
router.delete('/users/:id', authenticate, authController.deleteUser);

router.get('/roles', authenticate, authController.getRoles);
router.post('/roles', authenticate, authController.createRole);
router.delete('/roles/:name', authenticate, authController.deleteRole);

module.exports = router;

