const express = require('express');
const RolController = require('../controllers/RolController');

const router = express.Router();
const rolController = new RolController();

// GET /api/roles - Obtener todos los roles
router.get('/', (req, res) => rolController.getAll(req, res));

// GET /api/roles/:id - Obtener un rol por ID
router.get('/:id', (req, res) => rolController.getById(req, res));

// POST /api/roles - Crear un nuevo rol
router.post('/', (req, res) => rolController.create(req, res));

// PUT /api/roles/:id - Actualizar un rol
router.put('/:id', (req, res) => rolController.update(req, res));

// DELETE /api/roles/:id - Eliminar un rol
router.delete('/:id', (req, res) => rolController.delete(req, res));

module.exports = router;
