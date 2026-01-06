const express = require('express');
const UsuarioController = require('../controllers/UsuarioController');

const router = express.Router();
const usuarioController = new UsuarioController();

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', (req, res) => usuarioController.getAll(req, res));

// GET /api/usuarios/:id - Obtener un usuario por ID
router.get('/:id', (req, res) => usuarioController.getById(req, res));

// POST /api/usuarios - Crear un nuevo usuario
router.post('/', (req, res) => usuarioController.create(req, res));

// PUT /api/usuarios/:id - Actualizar un usuario
router.put('/:id', (req, res) => usuarioController.update(req, res));

// DELETE /api/usuarios/:id - Eliminar un usuario
router.delete('/:id', (req, res) => usuarioController.delete(req, res));

module.exports = router;
