const express = require('express');
const OrdenController = require('../controllers/OrdenController');

const router = express.Router();
const ordenController = new OrdenController();

// GET /api/ordenes - Obtener todas las órdenes (con filtros opcionales)
// Query params: ?id_cliente=X, ?id_estado=Y, ?id_flujo=Z
router.get('/', (req, res) => ordenController.getAll(req, res));

// GET /api/ordenes/cliente/:idCliente - Obtener órdenes de un cliente
router.get('/cliente/:idCliente', (req, res) => ordenController.getByCliente(req, res));

// GET /api/ordenes/estado/:idEstado - Obtener órdenes por estado
router.get('/estado/:idEstado', (req, res) => ordenController.getByEstado(req, res));

// GET /api/ordenes/:id - Obtener una orden por ID (con historial)
// Query param: ?historial=false para excluir historial
router.get('/:id', (req, res) => ordenController.getById(req, res));

// POST /api/ordenes - Crear una nueva orden
router.post('/', (req, res) => ordenController.create(req, res));

// PUT /api/ordenes/:id - Actualizar una orden
router.put('/:id', (req, res) => ordenController.update(req, res));

// PUT /api/ordenes/:id/estado - Cambiar estado de una orden
router.put('/:id/estado', (req, res) => ordenController.cambiarEstado(req, res));

// DELETE /api/ordenes/:id - Eliminar una orden
router.delete('/:id', (req, res) => ordenController.delete(req, res));

module.exports = router;
