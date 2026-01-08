const express = require('express');
const WhatsAppWebhookController = require('../controllers/WhatsAppWebhookController');

const router = express.Router();
const controller = new WhatsAppWebhookController();

router.post('/whatsapp', (req, res) => controller.handle(req, res));

module.exports = router;
