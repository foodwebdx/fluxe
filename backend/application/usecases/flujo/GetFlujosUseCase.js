const IUseCase = require('../../../domain/usecases/IUseCase');
const FlujoRepository = require('../../../infrastructure/repositories/FlujoRepository');

class GetFlujosUseCase extends IUseCase {
    constructor() {
        super();
        this.flujoRepository = new FlujoRepository();
    }

    async execute(soloActivos = false) {
        try {
            const flujos = soloActivos
                ? await this.flujoRepository.findActivos()
                : await this.flujoRepository.findAll();

            return {
                data: flujos.map(flujo => flujo.toJSON()),
                total: flujos.length
            };
        } catch (error) {
            console.error('Error en GetFlujosUseCase:', error);
            throw new Error('Error al obtener los flujos: ' + error.message);
        }
    }
}

module.exports = GetFlujosUseCase;
