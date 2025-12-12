const express = require('express');
const ExampleController = require('../controllers/ExampleController');

const router = express.Router();
const exampleController = new ExampleController();

// GET: Información sobre el endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint de ejemplo',
    methods: {
      GET: 'Obtiene información sobre este endpoint',
      POST: 'Procesa un mensaje',
    },
    example: {
      method: 'POST',
      url: '/api/example',
      body: {
        message: 'Tu mensaje aquí',
      },
    },
  });
});

// POST: Procesa el mensaje
router.post('/', (req, res) => exampleController.handle(req, res));

module.exports = router;

