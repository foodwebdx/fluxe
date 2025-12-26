const express = require('express');
const HistorialEstadoController = require('../controllers/HistorialEstadoController');

const router = express.Router();
const historialController = new HistorialEstadoController();

// GET /api/historial - Obtener todo el historial de cambios de estado
router.get('/', (req, res) => historialController.getAll(req, res));

// GET /api/historial/:id - Obtener un historial por ID
router.get('/:id', (req, res) => historialController.getById(req, res));

// GET /api/historial/orden/:idOrden - Obtener historial de una orden específica
router.get('/orden/:idOrden', (req, res) => historialController.getByOrden(req, res));

module.exports = router;
