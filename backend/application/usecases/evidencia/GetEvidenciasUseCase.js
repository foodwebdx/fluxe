const IUseCase = require('../../../domain/usecases/IUseCase');
const EvidenciaRepository = require('../../../infrastructure/repositories/EvidenciaRepository');

class GetEvidenciasUseCase extends IUseCase {
    constructor() {
        super();
        this.evidenciaRepository = new EvidenciaRepository();
    }

    async execute() {
        try {
            const evidencias = await this.evidenciaRepository.findAll();

            return {
                data: evidencias,
                total: evidencias.length
            };
        } catch (error) {
            console.error('Error en GetEvidenciasUseCase:', error);
            throw new Error('Error al obtener las evidencias: ' + error.message);
        }
    }
}

module.exports = GetEvidenciasUseCase;
