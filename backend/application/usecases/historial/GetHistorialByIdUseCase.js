const IUseCase = require('../../../domain/usecases/IUseCase');
const HistorialEstadoRepository = require('../../../infrastructure/repositories/HistorialEstadoRepository');

class GetHistorialByIdUseCase extends IUseCase {
    constructor() {
        super();
        this.historialRepository = new HistorialEstadoRepository();
    }

    async execute(id) {
        try {
            if (!id) {
                throw new Error('El ID del historial es requerido');
            }

            const historial = await this.historialRepository.findById(id);

            if (!historial) {
                throw new Error('Historial de estado no encontrado');
            }

            return {
                data: historial
            };
        } catch (error) {
            console.error('Error en GetHistorialByIdUseCase:', error);
            throw new Error('Error al obtener el historial: ' + error.message);
        }
    }
}

module.exports = GetHistorialByIdUseCase;
