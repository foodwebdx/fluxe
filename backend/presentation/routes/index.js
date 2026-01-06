const express = require('express');
const exampleRoutes = require('./example.routes');
const clienteRoutes = require('./cliente.routes');
const estadoRoutes = require('./estado.routes');
const flujoRoutes = require('./flujo.routes');
const productoRoutes = require('./producto.routes');
const ordenRoutes = require('./orden.routes');
const historialRoutes = require('./historial.routes');
const comentarioRoutes = require('./comentario.routes');
const evidenciaRoutes = require('./evidencia.routes');

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
      ordenes: {
        path: '/api/ordenes',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Gestión completa de órdenes de servicio (RF-01)',
        endpoints: [
          'GET /api/ordenes - Listar todas (filtros: ?id_cliente, ?id_estado, ?id_flujo)',
          'GET /api/ordenes/:id - Obtener por ID con historial',
          'GET /api/ordenes/cliente/:idCliente - Órdenes de un cliente',
          'GET /api/ordenes/estado/:idEstado - Órdenes por estado',
          'POST /api/ordenes - Crear orden',
          'PUT /api/ordenes/:id - Actualizar orden',
          'PUT /api/ordenes/:id/estado - Cambiar estado',
          'DELETE /api/ordenes/:id - Eliminar orden'
        ]
      },
      historial: {
        path: '/api/historial',
        methods: ['GET'],
        description: 'Consulta del historial de cambios de estado de órdenes',
        endpoints: [
          'GET /api/historial - Listar todo el historial',
          'GET /api/historial/:id - Obtener un historial por ID',
          'GET /api/historial/orden/:idOrden - Historial de una orden específica'
        ]
      },
      comentarios: {
        path: '/api/comentarios',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Gestión de comentarios asociados a cambios de estado',
        endpoints: [
          'GET /api/comentarios - Listar todos los comentarios',
          'GET /api/comentarios/historial/:idHistorial - Comentarios de un historial',
          'POST /api/comentarios - Crear comentario',
          'PUT /api/comentarios/:id - Actualizar comentario',
          'DELETE /api/comentarios/:id - Eliminar comentario'
        ]
      },
      evidencias: {
        path: '/api/evidencias',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Gestión de evidencias/archivos asociados a órdenes',
        endpoints: [
          'GET /api/evidencias - Listar todas las evidencias',
          'GET /api/evidencias/orden/:idOrden - Evidencias de una orden',
          'POST /api/evidencias - Crear evidencia',
          'PUT /api/evidencias/:id - Actualizar evidencia',
          'DELETE /api/evidencias/:id - Eliminar evidencia'
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
router.use('/ordenes', ordenRoutes);
router.use('/historial', historialRoutes);
router.use('/comentarios', comentarioRoutes);
router.use('/evidencias', evidenciaRoutes);

module.exports = router;

