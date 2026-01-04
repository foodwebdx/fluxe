const IUseCase = require('../../../domain/usecases/IUseCase');
const EvidenciaRepository = require('../../../infrastructure/repositories/EvidenciaRepository');
const Evidencia = require('../../../domain/entities/Evidencia');
const S3Service = require('../../../infrastructure/services/S3Service');

class CreateEvidenciaUseCase extends IUseCase {
    constructor() {
        super();
        this.evidenciaRepository = new EvidenciaRepository();
        this.s3Service = new S3Service();
    }

    async execute(evidenciaData, file) {
        try {
            // Validar que se haya enviado un archivo
            if (!file) {
                throw new Error('No se ha proporcionado ningún archivo');
            }

            // Generar key único para S3
            const timestamp = Date.now();
            const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
            const s3Key = `evidencias/${evidenciaData.id_orden}/${timestamp}_${sanitizedFilename}`;

            // Subir archivo a S3
            const s3Url = await this.s3Service.uploadFile(
                file.buffer,
                s3Key,
                file.mimetype
            );

            // Determinar tipo de evidencia
            let tipoEvidencia = 'other';
            if (file.mimetype.startsWith('image/')) {
                tipoEvidencia = 'image';
            } else if (file.mimetype === 'application/pdf') {
                tipoEvidencia = 'pdf';
            } else if (file.mimetype.includes('word') || file.mimetype.includes('document')) {
                tipoEvidencia = 'document';
            }

            // Preparar datos de evidencia
            const evidenciaCompleta = {
                ...evidenciaData,
                s3_key: s3Key,
                tipo_evidencia: tipoEvidencia,
                nombre_archivo_original: file.originalname
            };

            // Crear entidad para validar
            const evidencia = new Evidencia(evidenciaCompleta);

            // Validar entidad
            const errors = evidencia.validate();
            if (errors.length > 0) {
                // Si hay errores de validación, eliminar archivo de S3
                await this.s3Service.deleteFile(s3Key);
                throw new Error('Errores de validación: ' + errors.join(', '));
            }

            // Crear en la base de datos
            const nuevaEvidencia = await this.evidenciaRepository.create(evidenciaCompleta);

            // Agregar URL firmada para acceso temporal
            const signedUrl = await this.s3Service.getSignedUrl(s3Key);

            return {
                data: {
                    ...nuevaEvidencia,
                    url: signedUrl
                }
            };
        } catch (error) {
            console.error('Error en CreateEvidenciaUseCase:', error);
            throw new Error('Error al crear la evidencia: ' + error.message);
        }
    }
}

module.exports = CreateEvidenciaUseCase;
