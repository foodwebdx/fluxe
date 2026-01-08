const IUseCase = require('../../../domain/usecases/IUseCase');
const BloqueoEstadoRepository = require('../../../infrastructure/repositories/BloqueoEstadoRepository');

class GetBloqueosEstadoUseCase extends IUseCase {
    constructor() {
        super();
        this.bloqueoRepository = new BloqueoEstadoRepository();
    }

    async execute() {
        try {
            const bloqueos = await this.bloqueoRepository.findAll();

            return {
                data: bloqueos,
                total: bloqueos.length
            };
        } catch (error) {
            console.error('Error en GetBloqueosEstadoUseCase:', error);
            throw new Error('Error al obtener los bloqueos: ' + error.message);
        }
    }
}

module.exports = GetBloqueosEstadoUseCase;
