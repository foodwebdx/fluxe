const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this._transporter = null;
        this._initialized = false;
    }

    _initializeTransporter() {
        if (this._initialized) return;

        this.enabled = process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true';
        this.host = process.env.SMTP_HOST;
        this.port = parseInt(process.env.SMTP_PORT || '0', 10);
        this.user = process.env.SMTP_USER;
        this.pass = process.env.SMTP_PASS;
        this.from = process.env.SMTP_FROM || this.user;
        this.secure = process.env.SMTP_SECURE === 'true';

        if (this.host && this.port && this.user && this.pass) {
            this._transporter = nodemailer.createTransport({
                host: this.host,
                port: this.port,
                secure: this.secure,
                auth: {
                    user: this.user,
                    pass: this.pass
                }
            });
        }

        this._initialized = true;
    }

    get transporter() {
        if (!this._initialized) {
            this._initializeTransporter();
        }
        return this._transporter;
    }

    isConfigured() {
        if (!this._initialized) {
            this._initializeTransporter();
        }
        return this.enabled && this.from && this.transporter;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    formatHtmlFromText(text) {
        return text.replace(/\n/g, '<br/>');
    }

    /**
     * Envia un correo electronico simple
     * @param {Object} data - Datos del correo
     * @param {string} data.to - Destinatario
     * @param {string} data.subject - Asunto
     * @param {string} data.text - Cuerpo del mensaje (texto plano)
     * @returns {Promise<Object>} - Resultado del envio
     */
    async sendEmail({ to, subject, text }) {
        if (!this.isConfigured()) {
            console.log('Email notifications disabled or not configured');
            return { sent: false, reason: 'service_disabled' };
        }

        if (!to) {
            console.log('Cliente sin correo electronico');
            return { sent: false, reason: 'no_email' };
        }

        if (!this.isValidEmail(to)) {
            console.log('Correo electronico invalido');
            return { sent: false, reason: 'invalid_email' };
        }

        try {
            const info = await this.transporter.sendMail({
                from: this.from,
                to,
                subject,
                text,
                html: this.formatHtmlFromText(text)
            });

            return {
                sent: true,
                timestamp: new Date(),
                messageId: info?.messageId
            };
        } catch (error) {
            console.error('Error sending email notification:', error);
            return {
                sent: false,
                error: error.message,
                timestamp: new Date()
            };
        }
    }
}

module.exports = new EmailService();
