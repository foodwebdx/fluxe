const express = require('express');
const WhatsAppMensajeController = require('../controllers/WhatsAppMensajeController');

const router = express.Router();
const controller = new WhatsAppMensajeController();

router.get('/', (req, res) => controller.getAll(req, res));
router.get('/orden/:idOrden', (req, res) => controller.getByOrden(req, res));

module.exports = router;
