const express = require('express');
const ProductoController = require('../controllers/ProductoController');

const router = express.Router();
const productoController = new ProductoController();

// GET /api/productos - Obtener todos los productos
router.get('/', (req, res) => productoController.getAll(req, res));

// GET /api/productos/cliente/:idCliente - Obtener productos de un cliente
router.get('/cliente/:idCliente', (req, res) => productoController.getByCliente(req, res));

// GET /api/productos/:id - Obtener un producto por ID
router.get('/:id', (req, res) => productoController.getById(req, res));

// POST /api/productos - Crear un nuevo producto
router.post('/', (req, res) => productoController.create(req, res));

// PUT /api/productos/:id - Actualizar un producto
router.put('/:id', (req, res) => productoController.update(req, res));

// DELETE /api/productos/:id - Eliminar un producto
router.delete('/:id', (req, res) => productoController.delete(req, res));

module.exports = router;
