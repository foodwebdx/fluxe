const emailServiceInstance = require('./EmailService');

// WhatsAppService usa ES6 modules, lo importamos dinámicamente
let whatsappServiceInstance = null;

async function getWhatsAppService() {
    if (!whatsappServiceInstance) {
        const module = await import('./WhatsAppService.js');
        whatsappServiceInstance = module.default;
    }
    return whatsappServiceInstance;
}

/**
 * Servicio para enviar alertas de órdenes próximas a vencer
 */
class AlertasService {
    constructor() {
        this.emailService = emailServiceInstance;
    }

    /**
     * Genera el mensaje de alerta para una orden
     * @param {Object} orden - Datos de la orden
     * @returns {string} - Mensaje formateado
     */
    generarMensajeAlerta(orden) {
        const nombreCliente = orden.clientes?.nombre_completo || 'N/A';
        const nombreProducto = orden.productos?.nombre_producto || 'N/A';
        const estadoActual = orden.estados?.nombre_estado || 'N/A';
        const diasRestantes = orden.dias_restantes;
        const nivelUrgencia = orden.nivel_urgencia;

        let emoji = '⚠️';
        let titulo = 'ALERTA DE ORDEN PRÓXIMA A VENCER';
        
        if (nivelUrgencia === 'VENCIDO') {
            emoji = '🚨🚨🚨';
            titulo = 'ALERTA CRÍTICA - ORDEN VENCIDA';
        } else if (nivelUrgencia === 'CRITICO') {
            emoji = '🚨';
            titulo = 'ALERTA CRÍTICA - ORDEN VENCE HOY';
        } else if (nivelUrgencia === 'ALTO') {
            emoji = '⚠️';
            titulo = 'ALERTA DE ORDEN PRÓXIMA A VENCER';
        }

        const fechaEntrega = new Date(orden.fecha_estimada_entrega).toLocaleDateString('es-CO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        let mensaje = `${emoji} *${titulo}* ${emoji}\n\n`;
        mensaje += `*Orden:* #${orden.id_orden}\n`;
        mensaje += `*Cliente:* ${nombreCliente}\n`;
        mensaje += `*Producto:* ${nombreProducto}\n`;
        mensaje += `*Estado Actual:* ${estadoActual}\n`;
        mensaje += `*Fecha de Entrega:* ${fechaEntrega}\n`;

        if (nivelUrgencia === 'VENCIDO') {
            mensaje += `*⚠️ RETRASO:* ${orden.dias_retraso} día(s) vencidos\n`;
            mensaje += `*Nivel de Urgencia:* ${nivelUrgencia}\n\n`;
            mensaje += `🚨 *ORDEN CON RETRASO* - Se venció hace ${orden.dias_retraso} día(s)\n`;
            mensaje += `⚡ Requiere atención inmediata para resolver el retraso\n`;
        } else {
            mensaje += `*Días Restantes:* ${diasRestantes} día(s)\n`;
            mensaje += `*Nivel de Urgencia:* ${nivelUrgencia}\n\n`;
            
            if (diasRestantes === 0) {
                mensaje += '⏰ *LA ENTREGA ES HOY* - Acción inmediata requerida\n';
            } else if (diasRestantes === 1) {
                mensaje += '⏰ *LA ENTREGA ES MAÑANA* - Revisar estado urgentemente\n';
            } else {
                mensaje += `⏰ Quedan solo ${diasRestantes} días para la entrega\n`;
            }
        }

        if (orden.descripcion_servicio) {
            mensaje += `\n*Descripción:* ${orden.descripcion_servicio}`;
        }

        return mensaje;
    }

    /**
     * Genera el asunto del email de alerta
     * @param {number} totalOrdenes - Total de órdenes con alerta
     * @returns {string} - Asunto del email
     */
    generarAsuntoEmail(totalOrdenes) {
        const emoji = totalOrdenes > 5 ? '🚨' : '⚠️';
        return `${emoji} Alerta: ${totalOrdenes} orden(es) próxima(s) a vencer`;
    }

    /**
     * Genera el cuerpo del email con resumen de alertas
     * @param {Array} ordenes - Órdenes con alerta
     * @returns {string} - Cuerpo del email
     */
    generarCuerpoEmailResumen(ordenes) {
        let mensaje = `ALERTA DE ÓRDENES PRÓXIMAS A VENCER Y VENCIDAS\n`;
        mensaje += `================================================\n\n`;
        mensaje += `Se han detectado ${ordenes.length} orden(es) que requieren atención:\n\n`;

        // Agrupar por nivel de urgencia
        const vencidas = ordenes.filter(o => o.nivel_urgencia === 'VENCIDO');
        const criticas = ordenes.filter(o => o.nivel_urgencia === 'CRITICO');
        const altas = ordenes.filter(o => o.nivel_urgencia === 'ALTO');
        const medias = ordenes.filter(o => o.nivel_urgencia === 'MEDIO');

        if (vencidas.length > 0) {
            mensaje += `🚨🚨 VENCIDAS (CON RETRASO): ${vencidas.length}\n`;
            vencidas.forEach(orden => {
                mensaje += `   - Orden #${orden.id_orden}: ${orden.clientes?.nombre_completo} (${orden.dias_retraso} día(s) de retraso)\n`;
            });
            mensaje += '\n';
        }

        if (criticas.length > 0) {
            mensaje += `🚨 CRÍTICAS (Entrega hoy): ${criticas.length}\n`;
            criticas.forEach(orden => {
                mensaje += `   - Orden #${orden.id_orden}: ${orden.clientes?.nombre_completo}\n`;
            });
            mensaje += '\n';
        }

        if (altas.length > 0) {
            mensaje += `⚠️ ALTAS (Entrega mañana): ${altas.length}\n`;
            altas.forEach(orden => {
                mensaje += `   - Orden #${orden.id_orden}: ${orden.clientes?.nombre_completo}\n`;
            });
            mensaje += '\n';
        }

        if (medias.length > 0) {
            mensaje += `📋 MEDIAS (2 días): ${medias.length}\n`;
            medias.forEach(orden => {
                mensaje += `   - Orden #${orden.id_orden}: ${orden.clientes?.nombre_completo}\n`;
            });
            mensaje += '\n';
        }

        mensaje += `\nFecha de verificación: ${new Date().toLocaleString('es-CO')}\n`;
        mensaje += `\nPor favor, revise estas órdenes en el sistema Fluxe.`;

        return mensaje;
    }

    /**
     * Envía alertas a los administradores
     * @param {Array} ordenes - Órdenes con alerta
     * @param {Array} admins - Usuarios administradores
     * @returns {Promise<Object>} - Resultado del envío
     */
    async enviarAlertas(ordenes, admins) {
        if (!ordenes || ordenes.length === 0) {
            console.log('ℹ️ No hay órdenes con alertas para enviar');
            return {
                success: true,
                message: 'No hay órdenes con alertas',
                ordenes: 0,
                notificaciones_enviadas: 0
            };
        }

        console.log(`📤 Enviando alertas de ${ordenes.length} orden(es) a ${admins.length} admin(s)`);

        const whatsappService = await getWhatsAppService();
        const resultados = {
            whatsapp: [],
            email: [],
            errores: []
        };

        // Enviar resumen por email a todos los admins
        const asunto = this.generarAsuntoEmail(ordenes.length);
        const cuerpoEmail = this.generarCuerpoEmailResumen(ordenes);

        for (const admin of admins) {
            // Enviar email
            if (admin.email) {
                try {
                    const resultadoEmail = await this.emailService.sendEmail({
                        to: admin.email,
                        subject: asunto,
                        text: cuerpoEmail
                    });
                    resultados.email.push({
                        admin: admin.nombre,
                        email: admin.email,
                        ...resultadoEmail
                    });
                } catch (error) {
                    console.error(`Error enviando email a ${admin.email}:`, error);
                    resultados.errores.push({
                        tipo: 'email',
                        admin: admin.nombre,
                        email: admin.email,
                        error: error.message
                    });
                }
            }

            // Enviar WhatsApp (ordenes vencidas, criticas y altas)
            if (admin.telefono) {
                const ordenesUrgentes = ordenes.filter(
                    (orden) =>
                        orden.nivel_urgencia === 'VENCIDO' ||
                        orden.nivel_urgencia === 'CRITICO' ||
                        orden.nivel_urgencia === 'ALTO'
                );

                for (const orden of ordenesUrgentes) {
                    try {
                        const mensaje = this.generarMensajeAlerta(orden);
                        const resultadoWsp = await whatsappService.sendTextMessage(
                            admin.telefono,
                            mensaje
                        );
                        resultados.whatsapp.push({
                            admin: admin.nombre,
                            telefono: admin.telefono,
                            orden: orden.id_orden,
                            ...resultadoWsp
                        });
                    } catch (error) {
                        console.error(`Error enviando WhatsApp a ${admin.telefono}:`, error);
                        resultados.errores.push({
                            tipo: 'whatsapp',
                            admin: admin.nombre,
                            orden: orden.id_orden,
                            error: error.message
                        });
                    }
                }
            }
        }

        const totalEnviados = resultados.email.length + resultados.whatsapp.length;

        console.log(`✅ Alertas enviadas: ${totalEnviados} notificaciones`);
        console.log(`   📧 Emails: ${resultados.email.length}`);
        console.log(`   📱 WhatsApp: ${resultados.whatsapp.length}`);
        if (resultados.errores.length > 0) {
            console.log(`   ❌ Errores: ${resultados.errores.length}`);
        }

        return {
            success: true,
            ordenes: ordenes.length,
            notificaciones_enviadas: totalEnviados,
            detalles: resultados
        };
    }
}

module.exports = AlertasService;
