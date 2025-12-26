const IUseCase = require('../../../domain/usecases/IUseCase');
const EvidenciaRepository = require('../../../infrastructure/repositories/EvidenciaRepository');

class GetEvidenciasByOrdenUseCase extends IUseCase {
    constructor() {
        super();
        this.evidenciaRepository = new EvidenciaRepository();
    }

    async execute(idOrden) {
        try {
            if (!idOrden) {
                throw new Error('El ID de la orden es requerido');
            }

            const evidencias = await this.evidenciaRepository.findByOrden(idOrden);

            return {
                data: evidencias,
                total: evidencias.length
            };
        } catch (error) {
            console.error('Error en GetEvidenciasByOrdenUseCase:', error);
            throw new Error('Error al obtener las evidencias de la orden: ' + error.message);
        }
    }
}

module.exports = GetEvidenciasByOrdenUseCase;
