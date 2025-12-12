const express = require('express');
const ClienteController = require('../controllers/ClienteController');

const router = express.Router();
const clienteController = new ClienteController();

// GET /api/clientes - Obtener todos los clientes
router.get('/', (req, res) => clienteController.getAll(req, res));

module.exports = router;

