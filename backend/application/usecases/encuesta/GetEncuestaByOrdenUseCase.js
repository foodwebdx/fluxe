const IUseCase = require('../../../domain/usecases/IUseCase');
const EncuestaRepository = require('../../../infrastructure/repositories/EncuestaRepository');

class GetEncuestaByOrdenUseCase extends IUseCase {
    constructor() {
        super();
        this.encuestaRepository = new EncuestaRepository();
    }

    async execute(idOrden) {
        try {
            if (!idOrden) {
                throw new Error('El ID de la orden es requerido');
            }

            const encuesta = await this.encuestaRepository.findByOrden(idOrden);

            if (!encuesta) {
                throw new Error('Encuesta no encontrada');
            }

            return {
                data: encuesta
            };
        } catch (error) {
            console.error('Error en GetEncuestaByOrdenUseCase:', error);
            throw new Error('Error al obtener la encuesta: ' + error.message);
        }
    }
}

module.exports = GetEncuestaByOrdenUseCase;
