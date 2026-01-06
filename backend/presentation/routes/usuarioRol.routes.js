const express = require('express');
const UsuarioRolController = require('../controllers/UsuarioRolController');

const router = express.Router();
const usuarioRolController = new UsuarioRolController();

// GET /api/usuarios-roles - Obtener todas las relaciones usuario-rol
router.get('/', (req, res) => usuarioRolController.getAll(req, res));

// GET /api/usuarios-roles/usuario/:idUsuario - Obtener roles de un usuario
router.get('/usuario/:idUsuario', (req, res) => usuarioRolController.getByUsuario(req, res));

// POST /api/usuarios-roles - Asignar rol a usuario
router.post('/', (req, res) => usuarioRolController.create(req, res));

// DELETE /api/usuarios-roles/:idUsuario/:idRol - Eliminar rol de usuario
router.delete('/:idUsuario/:idRol', (req, res) => usuarioRolController.delete(req, res));

module.exports = router;
