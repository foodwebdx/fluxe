const express = require('express');
const EncuestaController = require('../controllers/EncuestaController');

const router = express.Router();
const encuestaController = new EncuestaController();

// GET /api/encuestas - Obtener todas las encuestas
router.get('/', (req, res) => encuestaController.getAll(req, res));

// GET /api/encuestas/orden/:idOrden - Obtener encuesta por orden
router.get('/orden/:idOrden', (req, res) => encuestaController.getByOrden(req, res));

// GET /api/encuestas/:id - Obtener encuesta por ID de orden
router.get('/:id', (req, res) => encuestaController.getById(req, res));

// POST /api/encuestas - Crear encuesta
router.post('/', (req, res) => encuestaController.create(req, res));

// PUT /api/encuestas/:id - Actualizar encuesta
router.put('/:id', (req, res) => encuestaController.update(req, res));

// DELETE /api/encuestas/:id - Eliminar encuesta
router.delete('/:id', (req, res) => encuestaController.delete(req, res));

module.exports = router;
