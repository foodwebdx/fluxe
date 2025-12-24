const express = require('express');
const FlujoController = require('../controllers/FlujoController');

const router = express.Router();
const flujoController = new FlujoController();

// GET /api/flujos - Obtener todos los flujos (query param: ?activos=true)
router.get('/', (req, res) => flujoController.getAll(req, res));

// GET /api/flujos/:id - Obtener un flujo por ID
router.get('/:id', (req, res) => flujoController.getById(req, res));

// POST /api/flujos - Crear un nuevo flujo
router.post('/', (req, res) => flujoController.create(req, res));

// PUT /api/flujos/:id - Actualizar un flujo
router.put('/:id', (req, res) => flujoController.update(req, res));

// DELETE /api/flujos/:id - Eliminar un flujo
router.delete('/:id', (req, res) => flujoController.delete(req, res));

// GET /api/flujos/:id/estados - Obtener estados de un flujo
router.get('/:id/estados', (req, res) => flujoController.getEstados(req, res));

// PUT /api/flujos/:id/estados - Configurar estados de un flujo
router.put('/:id/estados', (req, res) => flujoController.configurarEstados(req, res));

module.exports = router;
