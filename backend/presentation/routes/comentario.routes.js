const express = require('express');
const ComentarioEstadoController = require('../controllers/ComentarioEstadoController');

const router = express.Router();
const comentarioController = new ComentarioEstadoController();

// GET /api/comentarios - Obtener todos los comentarios
router.get('/', (req, res) => comentarioController.getAll(req, res));

// GET /api/comentarios/historial/:idHistorial - Obtener comentarios de un historial específico
router.get('/historial/:idHistorial', (req, res) => comentarioController.getByHistorial(req, res));

// POST /api/comentarios - Crear un nuevo comentario
router.post('/', (req, res) => comentarioController.create(req, res));

// PUT /api/comentarios/:id - Actualizar un comentario
router.put('/:id', (req, res) => comentarioController.update(req, res));

// DELETE /api/comentarios/:id - Eliminar un comentario
router.delete('/:id', (req, res) => comentarioController.delete(req, res));

module.exports = router;
