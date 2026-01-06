const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();
const authController = new AuthController();

// POST /api/auth/login - Iniciar sesion
router.post('/login', (req, res) => authController.login(req, res));

module.exports = router;
