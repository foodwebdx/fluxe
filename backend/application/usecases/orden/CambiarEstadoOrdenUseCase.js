const IUseCase = require('../../../domain/usecases/IUseCase');
const OrdenRepository = require('../../../infrastructure/repositories/OrdenRepository');
const FlujoRepository = require('../../../infrastructure/repositories/FlujoRepository');
const HistorialEstadoRepository = require('../../../infrastructure/repositories/HistorialEstadoRepository');
const ClienteRepository = require('../../../infrastructure/repositories/ClienteRepository');
const WhatsAppService = require('../../../infrastructure/services/WhatsAppService').default;
const EmailService = require('../../../infrastructure/services/EmailService');
const WhatsAppMensajeRepository = require('../../../infrastructure/repositories/WhatsAppMensajeRepository');

class CambiarEstadoOrdenUseCase extends IUseCase {
    constructor() {
        super();
        this.ordenRepository = new OrdenRepository();
        this.flujoRepository = new FlujoRepository();
        this.historialRepository = new HistorialEstadoRepository();
        this.clienteRepository = new ClienteRepository();
        this.whatsAppMensajeRepository = new WhatsAppMensajeRepository();
    }

    async execute(idOrden, nuevoEstadoId, usuarioId = 1) {
        try {
            // 1. Obtener orden actual
            const orden = await this.ordenRepository.findById(idOrden);
            if (!orden) {
                throw new Error('Orden no encontrada');
            }

            // 2. Verificar que no sea el mismo estado
            if (orden.id_estado_actual === parseInt(nuevoEstadoId)) {
                throw new Error('La orden ya se encuentra en ese estado');
            }

            // 3. Obtener flujo y sus estados
            const estadosFlujo = await this.flujoRepository.getEstadosFlujo(orden.id_flujo);
            if (!estadosFlujo || estadosFlujo.length === 0) {
                throw new Error('El flujo no tiene estados configurados');
            }

            // 4. Validar que el nuevo estado pertenece al flujo
            const nuevoEstado = estadosFlujo.find(e => e.id_estado === parseInt(nuevoEstadoId));
            if (!nuevoEstado) {
                throw new Error('El estado especificado no pertenece al flujo de esta orden');
            }

            // 5. Obtener posiciones de estados
            const estadoActual = estadosFlujo.find(e => e.id_estado === orden.id_estado_actual);
            if (!estadoActual) {
                throw new Error('Estado actual no encontrado en el flujo');
            }

            const estadoActualPos = estadoActual.posicion;
            const nuevoEstadoPos = nuevoEstado.posicion;

            // 6. Validar transición de estado
            // Permitir avanzar o retroceder, pero validar estados obligatorios al avanzar
            if (nuevoEstadoPos > estadoActualPos) {
                // Avanzando: verificar que no se salten estados obligatorios
                const estadosIntermedios = estadosFlujo.filter(
                    e => e.posicion > estadoActualPos &&
                        e.posicion < nuevoEstadoPos &&
                        e.obligatorio
                );

                if (estadosIntermedios.length > 0) {
                    const nombresEstados = estadosIntermedios.map(e => e.estados?.nombre_estado || 'Estado').join(', ');
                    throw new Error(`No se pueden saltar los siguientes estados obligatorios: ${nombresEstados}`);
                }
            }
            // Si retrocede (nuevoEstadoPos < estadoActualPos), se permite sin restricciones

            // 7. Actualizar estado de la orden
            await this.ordenRepository.cambiarEstado(idOrden, nuevoEstadoId);

            // 8. Registrar en historial
            await this.historialRepository.create({
                id_orden: idOrden,
                id_estado: nuevoEstadoId,
                id_usuario_responsable: usuarioId,
                fecha_hora_cambio: new Date()
            });

            // 9. Determinar si es el último estado del flujo (basado en la posición más alta)
            const posicionMaxima = Math.max(...estadosFlujo.map(e => e.posicion));
            const esUltimoEstado = nuevoEstadoPos === posicionMaxima;

            // Si es el último estado del flujo, cerrar la orden
            if (esUltimoEstado) {
                await this.ordenRepository.update(idOrden, {
                    fecha_cierre: new Date()
                });
            }

            // 10. Obtener orden actualizada
            const ordenActualizada = await this.ordenRepository.findById(idOrden);

            // 11. Enviar notificaciones (sin bloquear el flujo)
            this.enviarNotificacionesCliente(ordenActualizada, nuevoEstado, esUltimoEstado).catch(error => {
                console.error('Error enviando notificaciones (no crítico):', error);
            });

            return {
                data: ordenActualizada,
                message: 'Estado de la orden actualizado exitosamente',
                estado_anterior: {
                    id_estado: estadoActual.id_estado,
                    nombre_estado: estadoActual.estados?.nombre_estado,
                    posicion: estadoActualPos
                },
                estado_nuevo: {
                    id_estado: nuevoEstado.id_estado,
                    nombre_estado: nuevoEstado.estados?.nombre_estado,
                    posicion: nuevoEstadoPos
                }
            };
        } catch (error) {
            console.error('Error en CambiarEstadoOrdenUseCase:', error);
            throw error;
        }
    }

    /**
     * Envía notificaciones al cliente sobre el cambio de estado
     * Este método es asíncrono y no bloquea el flujo principal
     */
    async enviarNotificacionesCliente(orden, nuevoEstado, esUltimoEstado = false) {
        try {
            // Obtener datos del cliente
            const cliente = await this.clienteRepository.findById(orden.id_cliente);

            if (!cliente) {
                console.log('Cliente no encontrado para notificación WhatsApp');
                return;
            }

            let resultado;

            // Si es el último estado, usar notificación de orden completada
            if (esUltimoEstado) {
                const baseUrl = process.env.FRONTEND_URL || 'https://fluxe-sepia.vercel.app';
                const encuestaUrl = `${baseUrl.replace(/\/+$/, '')}/encuesta-orden?orden=${orden.id_orden}`;
                const phoneNumber = cliente.telefono_contacto
                    ? WhatsAppService.formatPhoneNumber(cliente.telefono_contacto)
                    : null;

                const mensaje = `¡Excelente noticia ${cliente.nombre_completo}!\n\n` +
                    `Tu orden #${orden.id_orden} ha sido completada.\n\n` +
                    `Gracias por confiar en nosotros.\n\n` +
                    'Por favor, confirmanos si vas a venir por tu producto. Responde "Si" o "No".\n\n' +
                    `Queremos conocer tu experiencia. Completa esta encuesta:\n${encuestaUrl}`;
                const asunto = `Orden #${orden.id_orden} completada`;

                try {
                    await this.whatsAppMensajeRepository.deleteByOrden(orden.id_orden);
                } catch (error) {
                    console.error('Error limpiando mensajes previos de WhatsApp:', error.message);
                }

                const [resultadoWhatsApp, resultadoEmail] = await Promise.all([
                    WhatsAppService.notifyOrderCompleted(cliente, orden, encuestaUrl, mensaje),
                    EmailService.sendEmail({
                        to: cliente.correo_electronico,
                        subject: asunto,
                        text: mensaje
                    })
                ]);

                resultado = resultadoWhatsApp;

                if (resultadoWhatsApp.sent) {
                    console.log(`✅ Notificación de orden completada enviada a ${cliente.nombre_completo} (${cliente.telefono_contacto})`);
                    if (phoneNumber) {
                        const messageId = resultadoWhatsApp.messageId || `outbound-${orden.id_orden}-${Date.now()}`;
                        if (!resultadoWhatsApp.messageId) {
                            console.log('WhatsApp messageId missing, usando fallback para guardar outbound');
                        }
                        await this.whatsAppMensajeRepository.create({
                            id_orden: orden.id_orden,
                            message_id: messageId,
                            direction: 'outbound',
                            phone_number: phoneNumber,
                            conversation_id: null,
                            message_type: 'text',
                            body: mensaje
                        });
                    }
                } else {
                    console.log(`⚠️ No se envió notificación de orden completada: ${resultadoWhatsApp.reason || resultadoWhatsApp.error}`);
                }

                if (resultadoEmail.sent) {
                    console.log(`✅ Correo de orden completada enviado a ${cliente.nombre_completo} (${cliente.correo_electronico})`);
                } else {
                    console.log(`⚠️ No se envió correo de orden completada: ${resultadoEmail.reason || resultadoEmail.error}`);
                }
            } else {
                // Para cambios de estado normales, usar template de cambio de estado
                resultado = await WhatsAppService.notifyStatusChange(
                    cliente,
                    orden,
                    nuevoEstado.estados || { nombre_estado: 'Estado actualizado' }
                );

                if (resultado.sent) {
                    console.log(`✅ Notificación de cambio de estado enviada a ${cliente.nombre_completo} (${cliente.telefono_contacto})`);
                } else {
                    console.log(`⚠️ No se envió notificación de cambio de estado: ${resultado.reason || resultado.error}`);
                }
            }
        } catch (error) {
            // No lanzar error para no afectar el flujo principal
            console.error('Error en enviarNotificacionesCliente:', error.message);
        }
    }
}

module.exports = CambiarEstadoOrdenUseCase;
