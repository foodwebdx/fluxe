const express = require('express');
const exampleRoutes = require('./example.routes');
const clienteRoutes = require('./cliente.routes');
const estadoRoutes = require('./estado.routes');
const flujoRoutes = require('./flujo.routes');
const productoRoutes = require('./producto.routes');

const router = express.Router();

// Ruta informativa para /api
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Fluxe',
    version: '1.0.0',
    endpoints: {
      example: {
        path: '/api/example',
        methods: ['GET', 'POST'],
        description: 'Endpoint de ejemplo',
      },
      clientes: {
        path: '/api/clientes',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Gestión completa de clientes',
        endpoints: [
          'GET /api/clientes - Listar todos',
          'GET /api/clientes/:id - Obtener por ID',
          'GET /api/clientes/buscar?q=query - Buscar',
          'POST /api/clientes - Crear',
          'PUT /api/clientes/:id - Actualizar',
          'DELETE /api/clientes/:id - Eliminar'
        ]
      },
      estados: {
        path: '/api/estados',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Gestión de estados del flujo',
      },
      flujos: {
        path: '/api/flujos',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Gestión de flujos de trabajo parametrizables',
      },
      productos: {
        path: '/api/productos',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Gestión completa de productos',
        endpoints: [
          'GET /api/productos - Listar todos',
          'GET /api/productos/:id - Obtener por ID',
          'GET /api/productos/cliente/:idCliente - Productos de un cliente',
          'POST /api/productos - Crear',
          'PUT /api/productos/:id - Actualizar',
          'DELETE /api/productos/:id - Eliminar'
        ]
      },
    },
    timestamp: new Date().toISOString(),
  });
});

router.use('/example', exampleRoutes);
router.use('/clientes', clienteRoutes);
router.use('/estados', estadoRoutes);
router.use('/flujos', flujoRoutes);
router.use('/productos', productoRoutes);

module.exports = router;

