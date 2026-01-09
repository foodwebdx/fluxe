const IUseCase = require('../../../domain/usecases/IUseCase');
const OrdenRepository = require('../../../infrastructure/repositories/OrdenRepository');
const HistorialEstadoRepository = require('../../../infrastructure/repositories/HistorialEstadoRepository');
const WhatsAppMensajeRepository = require('../../../infrastructure/repositories/WhatsAppMensajeRepository');

class GetOrdenByIdUseCase extends IUseCase {
    constructor() {
        super();
        this.ordenRepository = new OrdenRepository();
        this.historialRepository = new HistorialEstadoRepository();
        this.mensajesRepository = new WhatsAppMensajeRepository();
    }

    async execute(id, incluirHistorial = true) {
        try {
            const orden = await this.ordenRepository.findById(id);

            if (!orden) {
                throw new Error('Orden no encontrada');
            }

            // Incluir historial de estados si se solicita
            if (incluirHistorial) {
                const historial = await this.historialRepository.findByOrden(id);
                orden.historial_estados = historial;
            }

            const respuestaCierre = await this.mensajesRepository.findLatestInboundByOrden(id, {
                excludeContextPrefix: 'bloqueo:'
            });
            orden.respuesta_cliente_cierre = respuestaCierre?.body || null;

            return {
                data: orden
            };
        } catch (error) {
            console.error('Error en GetOrdenByIdUseCase:', error);
            throw error;
        }
    }
}

module.exports = GetOrdenByIdUseCase;
