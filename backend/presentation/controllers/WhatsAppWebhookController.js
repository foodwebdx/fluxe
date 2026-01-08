const crypto = require('crypto');
const WhatsAppMensajeRepository = require('../../infrastructure/repositories/WhatsAppMensajeRepository');
const WhatsAppService = require('../../infrastructure/services/WhatsAppService').default;

const getMessageBody = (message) => {
    if (message?.kapso?.content) return message.kapso.content;
    if (message?.text?.body) return message.text.body;
    if (message?.interactive?.button_reply?.title) return message.interactive.button_reply.title;
    if (message?.interactive?.list_reply?.title) return message.interactive.list_reply.title;
    return null;
};

const normalizeYesNo = (text) => {
    if (!text) return null;
    return text
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z]/g, '');
};

const verifyWebhookSignature = (rawBody, signature, secret) => {
    if (!signature || !secret) return false;
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

    if (signature.length !== expectedSignature.length) {
        return false;
    }

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
};

class WhatsAppWebhookController {
    constructor() {
        this.mensajesRepository = new WhatsAppMensajeRepository();
    }

    async handle(req, res) {
        try {
            const secret = process.env.KAPSO_WEBHOOK_SECRET;
            const signature = req.headers['x-webhook-signature'];

            if (secret) {
                const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
                const isValid = verifyWebhookSignature(rawBody, signature, secret);

                if (!isValid) {
                    return res.status(401).send('Invalid signature');
                }
            }

            const event = req.headers['x-webhook-event'] || req.body?.event;
            const payload = req.body?.data || req.body;

            if (event !== 'whatsapp.message.received') {
                return res.status(200).send('OK');
            }

            const message = payload?.message;
            const conversation = payload?.conversation;
            const phoneNumberRaw = conversation?.phone_number;

            if (!message?.id || !phoneNumberRaw) {
                return res.status(200).send('OK');
            }

            const phoneNumber = WhatsAppService.formatPhoneNumber(phoneNumberRaw);
            const lastOutbound = await this.mensajesRepository.findLastOutboundByPhone(phoneNumber);

            if (!lastOutbound) {
                console.log('No se encontro mensaje outbound para asociar el inbound:', phoneNumber);
                return res.status(200).send('OK');
            }

            const body = getMessageBody(message);
            const normalized = normalizeYesNo(body);
            if (normalized !== 'si' && normalized !== 'no') {
                return res.status(200).send('OK');
            }

            const existingInbound = await this.mensajesRepository.findFirstInboundByOrdenSince(
                lastOutbound.id_orden,
                lastOutbound.created_at
            );
            if (existingInbound) {
                return res.status(200).send('OK');
            }

            const createdAt = message.timestamp
                ? new Date(parseInt(message.timestamp, 10) * 1000)
                : new Date();

            await this.mensajesRepository.create({
                id_orden: lastOutbound.id_orden,
                message_id: message.id,
                direction: 'inbound',
                phone_number: phoneNumber,
                conversation_id: conversation?.id || null,
                message_type: message.type || 'unknown',
                body,
                created_at: createdAt
            });

            return res.status(200).send('OK');
        } catch (error) {
            if (error.code === 'P2002') {
                return res.status(200).send('OK');
            }
            console.error('Error procesando webhook WhatsApp:', error);
            return res.status(500).send('Error');
        }
    }
}

module.exports = WhatsAppWebhookController;
