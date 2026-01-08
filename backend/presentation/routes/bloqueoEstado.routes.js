const express = require('express');
const BloqueoEstadoController = require('../controllers/BloqueoEstadoController');

const router = express.Router();
const bloqueoController = new BloqueoEstadoController();

// GET /api/bloqueos-estado - Obtener todos los bloqueos
router.get('/', (req, res) => bloqueoController.getAll(req, res));

// GET /api/bloqueos-estado/historial/:idHistorial - Obtener bloqueos de un historial especifico
router.get('/historial/:idHistorial', (req, res) => bloqueoController.getByHistorial(req, res));

// GET /api/bloqueos-estado/orden/:idOrden - Obtener bloqueos de una orden especifica
router.get('/orden/:idOrden', (req, res) => bloqueoController.getByOrden(req, res));

// POST /api/bloqueos-estado - Crear un nuevo bloqueo
router.post('/', (req, res) => bloqueoController.create(req, res));

// PUT /api/bloqueos-estado/:id - Actualizar un bloqueo
router.put('/:id', (req, res) => bloqueoController.update(req, res));

// DELETE /api/bloqueos-estado/:id - Eliminar un bloqueo
router.delete('/:id', (req, res) => bloqueoController.delete(req, res));

module.exports = router;
