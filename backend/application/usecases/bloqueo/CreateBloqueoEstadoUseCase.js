const IUseCase = require('../../../domain/usecases/IUseCase');
const BloqueoEstadoRepository = require('../../../infrastructure/repositories/BloqueoEstadoRepository');
const BloqueoEstado = require('../../../domain/entities/BloqueoEstado');
const HistorialEstadoRepository = require('../../../infrastructure/repositories/HistorialEstadoRepository');
const OrdenRepository = require('../../../infrastructure/repositories/OrdenRepository');
const WhatsAppService = require('../../../infrastructure/services/WhatsAppService').default;
const WhatsAppMensajeRepository = require('../../../infrastructure/repositories/WhatsAppMensajeRepository');

class CreateBloqueoEstadoUseCase extends IUseCase {
    constructor() {
        super();
        this.bloqueoRepository = new BloqueoEstadoRepository();
        this.historialRepository = new HistorialEstadoRepository();
        this.ordenRepository = new OrdenRepository();
        this.whatsAppMensajeRepository = new WhatsAppMensajeRepository();
    }

    async execute(bloqueoData) {
        try {
            const bloqueo = new BloqueoEstado(bloqueoData);

            const errors = bloqueo.validate();
            if (errors.length > 0) {
                throw new Error('Errores de validacion: ' + errors.join(', '));
            }

            const nuevoBloqueo = await this.bloqueoRepository.create(bloqueoData);

            try {
                let ordenId = nuevoBloqueo.historial_estados_orden?.id_orden;
                if (!ordenId && bloqueoData.id_historial) {
                    const historial = await this.historialRepository.findById(bloqueoData.id_historial);
                    ordenId = historial?.ordenes?.id_orden || historial?.id_orden;
                }

                if (ordenId) {
                    const orden = await this.ordenRepository.findById(ordenId);
                    const cliente = orden?.clientes || orden?.cliente;

                    if (cliente?.telefono_contacto) {
                        const phoneNumber = WhatsAppService.formatPhoneNumber(cliente.telefono_contacto);
                        const mensaje = `Tu orden #${ordenId} tiene un bloqueo.\n\n` +
                            `Motivo: ${nuevoBloqueo.descripcion_bloqueo}\n\n` +
                            'Confirmanos si el bloqueo ya se resolvio. Selecciona "Si" o "No".';

                        const tempMessageId = `bloqueo-${nuevoBloqueo.id_bloqueo}-${Date.now()}`;
                        const outboundRecord = await this.whatsAppMensajeRepository.create({
                            id_orden: ordenId,
                            message_id: tempMessageId,
                            direction: 'outbound',
                            phone_number: phoneNumber,
                            conversation_id: `bloqueo:${nuevoBloqueo.id_bloqueo}`,
                            message_type: 'interactive',
                            body: mensaje
                        });

                        const result = await WhatsAppService.sendInteractiveButtons(phoneNumber, mensaje, [
                            { id: 'btn_si', title: 'Si' },
                            { id: 'btn_no', title: 'No' }
                        ]);
                        if (result.sent) {
                            if (result.messageId) {
                                await this.whatsAppMensajeRepository.updateMessageId(
                                    outboundRecord.id_mensaje,
                                    result.messageId
                                );
                            }
                        } else {
                            await this.whatsAppMensajeRepository.deleteById(outboundRecord.id_mensaje);
                        }
                    }
                }
            } catch (notifyError) {
                console.error('Error enviando notificacion de bloqueo:', notifyError.message);
            }

            return {
                data: nuevoBloqueo
            };
        } catch (error) {
            console.error('Error en CreateBloqueoEstadoUseCase:', error);
            throw new Error('Error al crear el bloqueo: ' + error.message);
        }
    }
}

module.exports = CreateBloqueoEstadoUseCase;
