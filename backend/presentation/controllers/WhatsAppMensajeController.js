const WhatsAppMensajeRepository = require('../../infrastructure/repositories/WhatsAppMensajeRepository');

class WhatsAppMensajeController {
    constructor() {
        this.mensajesRepository = new WhatsAppMensajeRepository();
    }

    async getAll(req, res) {
        try {
            const { phone_number, direction, limit } = req.query;
            const mensajes = await this.mensajesRepository.findAll({
                phoneNumber: phone_number,
                direction,
                limit
            });

            return res.status(200).json({
                success: true,
                message: 'Mensajes obtenidos exitosamente',
                data: mensajes
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Error al obtener mensajes'
            });
        }
    }

    async getByOrden(req, res) {
        try {
            const { idOrden } = req.params;
            const mensajes = await this.mensajesRepository.findByOrden(idOrden);

            return res.status(200).json({
                success: true,
                message: 'Mensajes de WhatsApp obtenidos exitosamente',
                data: mensajes
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Error al obtener mensajes por orden'
            });
        }
    }
}

module.exports = WhatsAppMensajeController;
