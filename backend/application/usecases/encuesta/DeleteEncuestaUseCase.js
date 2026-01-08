const IUseCase = require('../../../domain/usecases/IUseCase');
const EncuestaRepository = require('../../../infrastructure/repositories/EncuestaRepository');

class DeleteEncuestaUseCase extends IUseCase {
    constructor() {
        super();
        this.encuestaRepository = new EncuestaRepository();
    }

    async execute(idOrden) {
        try {
            if (!idOrden) {
                throw new Error('El ID de la orden es requerido');
            }

            const encuestaExistente = await this.encuestaRepository.findByOrden(idOrden);
            if (!encuestaExistente) {
                throw new Error('Encuesta no encontrada');
            }

            await this.encuestaRepository.delete(idOrden);

            return {
                message: 'Encuesta eliminada exitosamente'
            };
        } catch (error) {
            console.error('Error en DeleteEncuestaUseCase:', error);
            throw new Error('Error al eliminar la encuesta: ' + error.message);
        }
    }
}

module.exports = DeleteEncuestaUseCase;
