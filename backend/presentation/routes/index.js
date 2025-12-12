const express = require('express');
const exampleRoutes = require('./example.routes');
const clienteRoutes = require('./cliente.routes');

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
    },
    timestamp: new Date().toISOString(),
  });
});

router.use('/example', exampleRoutes);
router.use('/clientes', clienteRoutes);

module.exports = router;

