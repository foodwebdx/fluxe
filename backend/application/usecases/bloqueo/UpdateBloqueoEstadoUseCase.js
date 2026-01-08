const IUseCase = require('../../../domain/usecases/IUseCase');
const BloqueoEstadoRepository = require('../../../infrastructure/repositories/BloqueoEstadoRepository');

class UpdateBloqueoEstadoUseCase extends IUseCase {
    constructor() {
        super();
        this.bloqueoRepository = new BloqueoEstadoRepository();
    }

    async execute(id, bloqueoData) {
        try {
            if (!id) {
                throw new Error('El ID del bloqueo es requerido');
            }

            const bloqueoExistente = await this.bloqueoRepository.findById(id);
            if (!bloqueoExistente) {
                throw new Error('Bloqueo no encontrado');
            }

            const bloqueoActualizado = await this.bloqueoRepository.update(id, bloqueoData);

            return {
                data: bloqueoActualizado
            };
        } catch (error) {
            console.error('Error en UpdateBloqueoEstadoUseCase:', error);
            throw new Error('Error al actualizar el bloqueo: ' + error.message);
        }
    }
}

module.exports = UpdateBloqueoEstadoUseCase;
