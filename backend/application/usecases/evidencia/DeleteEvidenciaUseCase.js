const IUseCase = require('../../../domain/usecases/IUseCase');
const EvidenciaRepository = require('../../../infrastructure/repositories/EvidenciaRepository');

class DeleteEvidenciaUseCase extends IUseCase {
    constructor() {
        super();
        this.evidenciaRepository = new EvidenciaRepository();
    }

    async execute(id) {
        try {
            if (!id) {
                throw new Error('El ID de la evidencia es requerido');
            }

            // Verificar que la evidencia existe
            const evidenciaExistente = await this.evidenciaRepository.findById(id);
            if (!evidenciaExistente) {
                throw new Error('Evidencia no encontrada');
            }

            // Eliminar la evidencia (nota: también deberías eliminar el archivo de S3)
            await this.evidenciaRepository.delete(id);

            return {
                message: 'Evidencia eliminada exitosamente',
                // Retornar el s3_key para que el controlador pueda eliminar el archivo de S3
                s3_key: evidenciaExistente.s3_key
            };
        } catch (error) {
            console.error('Error en DeleteEvidenciaUseCase:', error);
            throw new Error('Error al eliminar la evidencia: ' + error.message);
        }
    }
}

module.exports = DeleteEvidenciaUseCase;
