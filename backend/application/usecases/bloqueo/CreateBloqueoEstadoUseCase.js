const IUseCase = require('../../../domain/usecases/IUseCase');
const BloqueoEstadoRepository = require('../../../infrastructure/repositories/BloqueoEstadoRepository');
const BloqueoEstado = require('../../../domain/entities/BloqueoEstado');

class CreateBloqueoEstadoUseCase extends IUseCase {
    constructor() {
        super();
        this.bloqueoRepository = new BloqueoEstadoRepository();
    }

    async execute(bloqueoData) {
        try {
            const bloqueo = new BloqueoEstado(bloqueoData);

            const errors = bloqueo.validate();
            if (errors.length > 0) {
                throw new Error('Errores de validacion: ' + errors.join(', '));
            }

            const nuevoBloqueo = await this.bloqueoRepository.create(bloqueoData);

            return {
                data: nuevoBloqueo
            };
        } catch (error) {
            console.error('Error en CreateBloqueoEstadoUseCase:', error);
            throw new Error('Error al crear el bloqueo: ' + error.message);
        }
    }
}

module.exports = CreateBloqueoEstadoUseCase;
