const IUseCase = require('../../../domain/usecases/IUseCase');
const EncuestaRepository = require('../../../infrastructure/repositories/EncuestaRepository');

class GetEncuestasUseCase extends IUseCase {
    constructor() {
        super();
        this.encuestaRepository = new EncuestaRepository();
    }

    async execute() {
        try {
            const encuestas = await this.encuestaRepository.findAll();

            return {
                data: encuestas,
                total: encuestas.length
            };
        } catch (error) {
            console.error('Error en GetEncuestasUseCase:', error);
            throw new Error('Error al obtener las encuestas: ' + error.message);
        }
    }
}

module.exports = GetEncuestasUseCase;
