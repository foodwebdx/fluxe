const IUseCase = require('../../../domain/usecases/IUseCase');
const OrdenRepository = require('../../../infrastructure/repositories/OrdenRepository');
const HistorialEstadoRepository = require('../../../infrastructure/repositories/HistorialEstadoRepository');

class GetOrdenByIdUseCase extends IUseCase {
    constructor() {
        super();
        this.ordenRepository = new OrdenRepository();
        this.historialRepository = new HistorialEstadoRepository();
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
