const IUseCase = require('../../../domain/usecases/IUseCase');
const EvidenciaRepository = require('../../../infrastructure/repositories/EvidenciaRepository');
const Evidencia = require('../../../domain/entities/Evidencia');

class CreateEvidenciaUseCase extends IUseCase {
    constructor() {
        super();
        this.evidenciaRepository = new EvidenciaRepository();
    }

    async execute(evidenciaData) {
        try {
            // Crear entidad para validar
            const evidencia = new Evidencia(evidenciaData);

            // Validar entidad
            const errors = evidencia.validate();
            if (errors.length > 0) {
                throw new Error('Errores de validación: ' + errors.join(', '));
            }

            // Crear en la base de datos
            const nuevaEvidencia = await this.evidenciaRepository.create(evidenciaData);

            return {
                data: nuevaEvidencia
            };
        } catch (error) {
            console.error('Error en CreateEvidenciaUseCase:', error);
            throw new Error('Error al crear la evidencia: ' + error.message);
        }
    }
}

module.exports = CreateEvidenciaUseCase;
