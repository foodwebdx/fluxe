const IUseCase = require('../../../domain/usecases/IUseCase');
const EstadoRepository = require('../../../infrastructure/repositories/EstadoRepository');

class GetEstadosUseCase extends IUseCase {
    constructor() {
        super();
        this.estadoRepository = new EstadoRepository();
    }

    async execute() {
        try {
            const estados = await this.estadoRepository.findAll();

            return {
                data: estados.map(estado => estado.toJSON()),
                total: estados.length
            };
        } catch (error) {
            console.error('Error en GetEstadosUseCase:', error);
            throw new Error('Error al obtener los estados: ' + error.message);
        }
    }
}

module.exports = GetEstadosUseCase;
