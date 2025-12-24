const express = require('express');
const exampleRoutes = require('./example.routes');
const clienteRoutes = require('./cliente.routes');
const estadoRoutes = require('./estado.routes');
const flujoRoutes = require('./flujo.routes');

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
        methods: ['GET'],
        description: 'Obtener todos los clientes',
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
    },
    timestamp: new Date().toISOString(),
  });
});

router.use('/example', exampleRoutes);
router.use('/clientes', clienteRoutes);
router.use('/estados', estadoRoutes);
router.use('/flujos', flujoRoutes);

module.exports = router;

