const express = require('express');
const EstadoController = require('../controllers/EstadoController');

const router = express.Router();
const estadoController = new EstadoController();

// GET /api/estados - Obtener todos los estados
router.get('/', (req, res) => estadoController.getAll(req, res));

// GET /api/estados/:id - Obtener un estado por ID
router.get('/:id', (req, res) => estadoController.getById(req, res));

// POST /api/estados - Crear un nuevo estado
router.post('/', (req, res) => estadoController.create(req, res));

// PUT /api/estados/:id - Actualizar un estado
router.put('/:id', (req, res) => estadoController.update(req, res));

// DELETE /api/estados/:id - Eliminar un estado
router.delete('/:id', (req, res) => estadoController.delete(req, res));

module.exports = router;
