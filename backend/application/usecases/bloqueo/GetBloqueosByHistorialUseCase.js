const IUseCase = require('../../../domain/usecases/IUseCase');
const BloqueoEstadoRepository = require('../../../infrastructure/repositories/BloqueoEstadoRepository');

class GetBloqueosByHistorialUseCase extends IUseCase {
    constructor() {
        super();
        this.bloqueoRepository = new BloqueoEstadoRepository();
    }

    async execute(idHistorial) {
        try {
            if (!idHistorial) {
                throw new Error('El ID del historial es requerido');
            }

            const bloqueos = await this.bloqueoRepository.findByHistorial(idHistorial);

            return {
                data: bloqueos,
                total: bloqueos.length
            };
        } catch (error) {
            console.error('Error en GetBloqueosByHistorialUseCase:', error);
            throw new Error('Error al obtener los bloqueos del historial: ' + error.message);
        }
    }
}

module.exports = GetBloqueosByHistorialUseCase;
