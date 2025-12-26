const IUseCase = require('../../../domain/usecases/IUseCase');
const HistorialEstadoRepository = require('../../../infrastructure/repositories/HistorialEstadoRepository');

class GetHistorialUseCase extends IUseCase {
    constructor() {
        super();
        this.historialRepository = new HistorialEstadoRepository();
    }

    async execute() {
        try {
            const historial = await this.historialRepository.findAll();

            return {
                data: historial,
                total: historial.length
            };
        } catch (error) {
            console.error('Error en GetHistorialUseCase:', error);
            throw new Error('Error al obtener el historial de estados: ' + error.message);
        }
    }
}

module.exports = GetHistorialUseCase;
