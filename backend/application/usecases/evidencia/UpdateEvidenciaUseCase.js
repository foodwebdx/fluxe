const IUseCase = require('../../../domain/usecases/IUseCase');
const EvidenciaRepository = require('../../../infrastructure/repositories/EvidenciaRepository');

class UpdateEvidenciaUseCase extends IUseCase {
    constructor() {
        super();
        this.evidenciaRepository = new EvidenciaRepository();
    }

    async execute(id, evidenciaData) {
        try {
            if (!id) {
                throw new Error('El ID de la evidencia es requerido');
            }

            // Verificar que la evidencia existe
            const evidenciaExistente = await this.evidenciaRepository.findById(id);
            if (!evidenciaExistente) {
                throw new Error('Evidencia no encontrada');
            }

            // Actualizar la evidencia
            const evidenciaActualizada = await this.evidenciaRepository.update(id, evidenciaData);

            return {
                data: evidenciaActualizada
            };
        } catch (error) {
            console.error('Error en UpdateEvidenciaUseCase:', error);
            throw new Error('Error al actualizar la evidencia: ' + error.message);
        }
    }
}

module.exports = UpdateEvidenciaUseCase;
