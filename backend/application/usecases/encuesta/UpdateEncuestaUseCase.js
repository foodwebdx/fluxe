const IUseCase = require('../../../domain/usecases/IUseCase');
const EncuestaRepository = require('../../../infrastructure/repositories/EncuestaRepository');
const Encuesta = require('../../../domain/entities/Encuesta');

class UpdateEncuestaUseCase extends IUseCase {
    constructor() {
        super();
        this.encuestaRepository = new EncuestaRepository();
    }

    async execute(idOrden, encuestaData) {
        try {
            if (!idOrden) {
                throw new Error('El ID de la orden es requerido');
            }

            const encuestaExistente = await this.encuestaRepository.findByOrden(idOrden);
            if (!encuestaExistente) {
                throw new Error('Encuesta no encontrada');
            }

            const mergedData = {
                ...encuestaExistente,
                ...encuestaData,
                id_orden: parseInt(idOrden)
            };

            const encuesta = new Encuesta(mergedData);
            const errors = encuesta.validate();
            if (errors.length > 0) {
                throw new Error('Errores de validación: ' + errors.join(', '));
            }

            const encuestaActualizada = await this.encuestaRepository.update(idOrden, encuestaData);

            return {
                data: encuestaActualizada
            };
        } catch (error) {
            console.error('Error en UpdateEncuestaUseCase:', error);
            throw new Error('Error al actualizar la encuesta: ' + error.message);
        }
    }
}

module.exports = UpdateEncuestaUseCase;
