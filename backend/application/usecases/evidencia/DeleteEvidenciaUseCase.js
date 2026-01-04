const IUseCase = require('../../../domain/usecases/IUseCase');
const EvidenciaRepository = require('../../../infrastructure/repositories/EvidenciaRepository');
const S3Service = require('../../../infrastructure/services/S3Service');

class DeleteEvidenciaUseCase extends IUseCase {
    constructor() {
        super();
        this.evidenciaRepository = new EvidenciaRepository();
        this.s3Service = new S3Service();
    }

    async execute(id) {
        try {
            if (!id) {
                throw new Error('El ID de la evidencia es requerido');
            }

            // Obtener evidencia antes de eliminar
            const evidencia = await this.evidenciaRepository.findById(id);

            if (!evidencia) {
                throw new Error('Evidencia no encontrada');
            }

            // Eliminar archivo de S3
            if (evidencia.s3_key) {
                try {
                    await this.s3Service.deleteFile(evidencia.s3_key);
                } catch (s3Error) {
                    console.error('Error al eliminar archivo de S3:', s3Error);
                    // Continuar con la eliminación de la BD aunque falle S3
                }
            }

            // Eliminar de la base de datos
            await this.evidenciaRepository.delete(id);

            return {
                message: 'Evidencia eliminada exitosamente'
            };
        } catch (error) {
            console.error('Error en DeleteEvidenciaUseCase:', error);
            throw new Error('Error al eliminar la evidencia: ' + error.message);
        }
    }
}

module.exports = DeleteEvidenciaUseCase;
