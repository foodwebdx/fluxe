import { WhatsAppClient } from '@kapso/whatsapp-cloud-api';

/**
 * Servicio para enviar notificaciones de WhatsApp usando KAPSO API
 */
class WhatsAppService {
    constructor() {
        this._client = null;
        this._initialized = false;
    }

    /**
     * Inicializa el cliente de WhatsApp (lazy initialization)
     */
    _initializeClient() {
        if (this._initialized) return;

        this.phoneNumberId = process.env.KAPSO_PHONE_NUMBER_ID;
        this.businessAccountId = process.env.KAPSO_BUSINESS_ACCOUNT_ID;
        this.enabled = process.env.WHATSAPP_NOTIFICATIONS_ENABLED === 'true';

        if (process.env.KAPSO_API_KEY) {
            this._client = new WhatsAppClient({
                baseUrl: process.env.KAPSO_BASE_URL || 'https://api.kapso.ai/meta/whatsapp',
                kapsoApiKey: process.env.KAPSO_API_KEY
            });
        }

        this._initialized = true;
    }

    /**
     * Obtiene el cliente, inicializándolo si es necesario
     */
    get client() {
        if (!this._initialized) {
            this._initializeClient();
        }
        return this._client;
    }

    /**
     * Valida si el servicio está habilitado y configurado correctamente
     */
    isConfigured() {
        if (!this._initialized) {
            this._initializeClient();
        }
        return this.enabled && this.phoneNumberId && this._client;
    }

    /**
     * Formatea el número de teléfono al formato internacional
     * @param {string} telefono - Número de teléfono
     * @returns {string} - Número formateado
     */
    formatPhoneNumber(telefono) {
        // Eliminar espacios, guiones y paréntesis
        let cleaned = telefono.replace(/[\s\-\(\)]/g, '');

        // Si no empieza con +, agregar código de país Colombia (+57)
        if (!cleaned.startsWith('+')) {
            if (cleaned.startsWith('57')) {
                cleaned = '+' + cleaned;
            } else {
                cleaned = '+57' + cleaned;
            }
        }

        return cleaned;
    }

    /**
     * Envía una notificación de cambio de estado usando un template
     * @param {Object} cliente - Datos del cliente
     * @param {Object} orden - Datos de la orden
     * @param {Object} nuevoEstado - Nuevo estado de la orden
     * @returns {Promise<Object>} - Resultado del envío
     */
    async notifyStatusChange(cliente, orden, nuevoEstado) {
        if (!this.isConfigured()) {
            console.log('WhatsApp notifications disabled or not configured');
            return { sent: false, reason: 'service_disabled' };
        }

        if (!cliente.telefono_contacto) {
            console.log('Cliente sin teléfono de contacto');
            return { sent: false, reason: 'no_phone_number' };
        }

        try {
            const phoneNumber = this.formatPhoneNumber(cliente.telefono_contacto);

            // Enviar usando template
            const response = await this.client.messages.sendTemplate({
                phoneNumberId: this.phoneNumberId,
                to: phoneNumber,
                template: {
                    name: 'cambio_estado_orden',
                    language: { code: 'es_MX' },
                    components: [
                        {
                            type: 'body',
                            parameters: [
                                {
                                    type: 'text',
                                    parameterName: 'cliente_nombre',
                                    text: cliente.nombre_completo
                                },
                                {
                                    type: 'text',
                                    parameterName: 'orden_numero',
                                    text: `#${orden.id_orden}`
                                },
                                {
                                    type: 'text',
                                    parameterName: 'nuevo_estado',
                                    text: nuevoEstado.nombre_estado
                                }
                            ]
                        }
                    ]
                }
            });

            console.log('WhatsApp notification sent successfully:', {
                to: phoneNumber,
                orden: orden.id_orden,
                estado: nuevoEstado.nombre_estado
            });

            return {
                sent: true,
                timestamp: new Date(),
                messageId: response?.messages?.[0]?.id
            };
        } catch (error) {
            console.error('Error sending WhatsApp notification:', error);
            return {
                sent: false,
                error: error.message,
                timestamp: new Date()
            };
        }
    }

    /**
     * Envía un mensaje de texto simple (sin template)
     * @param {string} to - Número de teléfono destino
     * @param {string} body - Texto del mensaje
     * @returns {Promise<Object>} - Resultado del envío
     */
    async sendTextMessage(to, body) {
        if (!this.isConfigured()) {
            return { sent: false, reason: 'service_disabled' };
        }

        try {
            const phoneNumber = this.formatPhoneNumber(to);

            const response = await this.client.messages.sendText({
                phoneNumberId: this.phoneNumberId,
                to: phoneNumber,
                body: body
            });

            return {
                sent: true,
                timestamp: new Date(),
                messageId: response?.messages?.[0]?.id
            };
        } catch (error) {
            console.error('Error sending WhatsApp text message:', error);
            return {
                sent: false,
                error: error.message
            };
        }
    }

    /**
     * Envía un template genérico
     * @param {string} to - Número de teléfono destino
     * @param {string} templateName - Nombre del template
     * @param {Array} parameters - Parámetros del template
     * @returns {Promise<Object>} - Resultado del envío
     */
    async sendTemplate(to, templateName, parameters = []) {
        if (!this.isConfigured()) {
            return { sent: false, reason: 'service_disabled' };
        }

        try {
            const phoneNumber = this.formatPhoneNumber(to);

            const response = await this.client.messages.sendTemplate({
                phoneNumberId: this.phoneNumberId,
                to: phoneNumber,
                template: {
                    name: templateName,
                    language: { code: 'es_MX' },
                    components: [
                        {
                            type: 'body',
                            parameters: parameters
                        }
                    ]
                }
            });

            return {
                sent: true,
                timestamp: new Date(),
                messageId: response?.messages?.[0]?.id
            };
        } catch (error) {
            console.error('Error sending WhatsApp template:', error);
            return {
                sent: false,
                error: error.message
            };
        }
    }

    /**
     * Crea un template en KAPSO
     * @param {Object} templateData - Datos del template
     * @returns {Promise<Object>} - Resultado de la creación
     */
    async createTemplate(templateData) {
        try {
            const response = await this.client.templates.create({
                businessAccountId: this.businessAccountId,
                ...templateData
            });

            console.log('Template created successfully:', templateData.name);
            return { success: true, data: response };
        } catch (error) {
            console.error('Error creating template:', error);
            return { success: false, error: error.message };
        }
    }
}

// Exportar instancia única (Singleton)
export default new WhatsAppService();
