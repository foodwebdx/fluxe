const crypto = require('crypto');
const WhatsAppMensajeRepository = require('../../infrastructure/repositories/WhatsAppMensajeRepository');
const WhatsAppService = require('../../infrastructure/services/WhatsAppService').default;
const BloqueoEstadoRepository = require('../../infrastructure/repositories/BloqueoEstadoRepository');

const getMessageBody = (message) => {
    if (message?.interactive?.button_reply?.title) return message.interactive.button_reply.title;
    if (message?.interactive?.list_reply?.title) return message.interactive.list_reply.title;
    if (message?.text?.body) return message.text.body;
    if (message?.kapso?.content) return message.kapso.content;
    return null;
};

const normalizeText = (text) => {
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
        this.bloqueoRepository = new BloqueoEstadoRepository();
    }

    getEvent(req, payload) {
        const headerEvent = req.headers['x-webhook-event'];
        if (headerEvent) return headerEvent;
        const bodyEvent = req.body?.event;
        if (bodyEvent) return bodyEvent;
        if (payload?.message?.kapso?.direction === 'inbound') {
            return 'whatsapp.message.received';
        }
        return null;
    }

    async handle(req, res) {
        try {
            const secret = process.env.KAPSO_WEBHOOK_SECRET;
            const signature = req.headers['x-webhook-signature'];

            if (secret) {
                const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
                const isValid = verifyWebhookSignature(rawBody, signature, secret);

                if (!isValid) {
                    console.log('Webhook signature invalid');
                    return res.status(401).send('Invalid signature');
                }
            }

            const payload = req.body?.data || req.body;
            const event = this.getEvent(req, payload);
            if (!event) {
                console.log('Webhook ignored: missing event');
                return res.status(200).send('OK');
            }

            if (event !== 'whatsapp.message.received') {
                console.log('Webhook ignored: unsupported event', event);
                return res.status(200).send('OK');
            }

            const message = payload?.message;
            const conversation = payload?.conversation;
            const phoneNumberRaw = conversation?.phone_number;

            if (!message?.id || !phoneNumberRaw) {
                console.log('Webhook ignored: missing message id or phone number');
                return res.status(200).send('OK');
            }

            const phoneNumber = WhatsAppService.formatPhoneNumber(phoneNumberRaw);

            const body = getMessageBody(message);
            const normalized = normalizeText(body);

            if (normalized && normalized.includes('ayuda')) {
                const baseUrl = process.env.FRONTEND_URL || 'https://fluxe-sepia.vercel.app';
                const helpMessage = `Hola, en este momento estamos trabajando en tu orden. ` +
                    `En este link ${baseUrl.replace(/\/+$/, '')}/consulta-orden podrás ver comentarios, ` +
                    `evidencias y el flujo de cómo va la orden. ` +
                    `Cualquier actualización que se realice te la enviaremos por este canal.`;

                try {
                    const result = await WhatsAppService.sendTextMessage(phoneNumber, helpMessage);
                    if (result.sent) {
                        console.log('Help message sent to', phoneNumber);
                    } else {
                        console.log('Help message not sent:', result.reason || result.error);
                    }
                } catch (error) {
                    console.error('Error sending help message:', error.message);
                }
            }

            if (normalized !== 'si' && normalized !== 'no') {
                console.log('Webhook ignored: inbound is not si/no', body);
                return res.status(200).send('OK');
            }

            const bloqueoOutbound = await this.mensajesRepository.findLastOutboundByPhoneAndContextPrefix(
                phoneNumber,
                'bloqueo:'
            );
            if (bloqueoOutbound?.conversation_id) {
                const bloqueoId = parseInt(bloqueoOutbound.conversation_id.split(':')[1], 10);
                if (!Number.isNaN(bloqueoId)) {
                    const bloqueo = await this.bloqueoRepository.findById(bloqueoId);
                    if (!bloqueo) {
                        console.log('Bloqueo no encontrado para respuesta inbound:', bloqueoId);
                        return res.status(200).send('OK');
                    }

                    const existingInbound = await this.mensajesRepository.findFirstInboundByContext(
                        `bloqueo:${bloqueoId}`
                    );
                    if (existingInbound) {
                        console.log('Webhook ignored: inbound already stored for bloqueo', bloqueoId);
                        return res.status(200).send('OK');
                    }

                    await this.bloqueoRepository.update(bloqueoId, {
                        estado_bloqueado: normalized !== 'si',
                        respuesta_cliente: normalized
                    });

                    const createdAt = message.timestamp
                        ? new Date(parseInt(message.timestamp, 10) * 1000)
                        : new Date();

                    await this.mensajesRepository.create({
                        id_orden: bloqueo.historial_estados_orden?.id_orden || bloqueo.id_orden,
                        message_id: message.id,
                        direction: 'inbound',
                        phone_number: phoneNumber,
                        conversation_id: `bloqueo:${bloqueoId}`,
                        message_type: message.type || 'unknown',
                        body,
                        created_at: createdAt
                    });

                    console.log('Webhook stored bloqueo response', {
                        id_bloqueo: bloqueoId,
                        message_id: message.id,
                        body,
                        estado_bloqueado: normalized !== 'si'
                    });
                    return res.status(200).send('OK');
                }

                console.log('Webhook ignored: bloqueo context invalid', bloqueoOutbound.conversation_id);
                return res.status(200).send('OK');
            }

            const lastOutbound = await this.mensajesRepository.findLastOutboundByPhone(phoneNumber);
            if (!lastOutbound) {
                console.log('No se encontro mensaje outbound para asociar el inbound:', phoneNumber);
                return res.status(200).send('OK');
            }

            const existingInbound = await this.mensajesRepository.findFirstInboundByOrdenSince(
                lastOutbound.id_orden,
                lastOutbound.created_at
            );
            if (existingInbound) {
                console.log('Webhook ignored: inbound already stored for order', lastOutbound.id_orden);
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

            console.log('Webhook stored inbound response', {
                id_orden: lastOutbound.id_orden,
                message_id: message.id,
                body
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
