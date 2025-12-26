const IUseCase = require('../../../domain/usecases/IUseCase');
const HistorialEstadoRepository = require('../../../infrastructure/repositories/HistorialEstadoRepository');

class GetHistorialPorOrdenUseCase extends IUseCase {
    constructor() {
        super();
        this.historialRepository = new HistorialEstadoRepository();
    }

    async execute(idOrden) {
        try {
            if (!idOrden) {
                throw new Error('El ID de la orden es requerido');
            }

            const historial = await this.historialRepository.findByOrden(idOrden);

            return {
                data: historial,
                total: historial.length
            };
        } catch (error) {
            console.error('Error en GetHistorialPorOrdenUseCase:', error);
            throw new Error('Error al obtener el historial de la orden: ' + error.message);
        }
    }
}

module.exports = GetHistorialPorOrdenUseCase;
