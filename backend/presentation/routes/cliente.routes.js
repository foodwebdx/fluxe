const express = require('express');
const ClienteController = require('../controllers/ClienteController');

const router = express.Router();
const clienteController = new ClienteController();

// GET /api/clientes - Obtener todos los clientes
router.get('/', (req, res) => clienteController.getAll(req, res));

// GET /api/clientes/buscar?q=query - Buscar clientes
router.get('/buscar', (req, res) => clienteController.search(req, res));

// GET /api/clientes/:id - Obtener un cliente por ID
router.get('/:id', (req, res) => clienteController.getById(req, res));

// POST /api/clientes - Crear un nuevo cliente
router.post('/', (req, res) => clienteController.create(req, res));

// PUT /api/clientes/:id - Actualizar un cliente
router.put('/:id', (req, res) => clienteController.update(req, res));

// DELETE /api/clientes/:id - Eliminar un cliente
router.delete('/:id', (req, res) => clienteController.delete(req, res));

module.exports = router;

