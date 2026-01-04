const IUseCase = require('../../../domain/usecases/IUseCase');
const EvidenciaRepository = require('../../../infrastructure/repositories/EvidenciaRepository');
const S3Service = require('../../../infrastructure/services/S3Service');

class GetEvidenciasByOrdenUseCase extends IUseCase {
    constructor() {
        super();
        this.evidenciaRepository = new EvidenciaRepository();
        this.s3Service = new S3Service();
    }

    async execute(idOrden) {
        try {
            if (!idOrden) {
                throw new Error('El ID de la orden es requerido');
            }

            const evidencias = await this.evidenciaRepository.findByOrden(idOrden);

            // Agregar URLs firmadas a cada evidencia
            const evidenciasConUrls = await Promise.all(
                evidencias.map(async (evidencia) => {
                    try {
                        const signedUrl = await this.s3Service.getSignedUrl(evidencia.s3_key);
                        return {
                            ...evidencia,
                            url: signedUrl
                        };
                    } catch (error) {
                        console.error(`Error al generar URL para evidencia ${evidencia.id_evidencia}:`, error);
                        return evidencia;
                    }
                })
            );

            return {
                data: evidenciasConUrls,
                total: evidenciasConUrls.length
            };
        } catch (error) {
            console.error('Error en GetEvidenciasByOrdenUseCase:', error);
            throw new Error('Error al obtener las evidencias de la orden: ' + error.message);
        }
    }
}

module.exports = GetEvidenciasByOrdenUseCase;
