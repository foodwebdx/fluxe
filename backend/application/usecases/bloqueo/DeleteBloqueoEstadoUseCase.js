const IUseCase = require('../../../domain/usecases/IUseCase');
const BloqueoEstadoRepository = require('../../../infrastructure/repositories/BloqueoEstadoRepository');

class DeleteBloqueoEstadoUseCase extends IUseCase {
    constructor() {
        super();
        this.bloqueoRepository = new BloqueoEstadoRepository();
    }

    async execute(id) {
        try {
            if (!id) {
                throw new Error('El ID del bloqueo es requerido');
            }

            const bloqueoExistente = await this.bloqueoRepository.findById(id);
            if (!bloqueoExistente) {
                throw new Error('Bloqueo no encontrado');
            }

            await this.bloqueoRepository.delete(id);

            return {
                message: 'Bloqueo eliminado exitosamente'
            };
        } catch (error) {
            console.error('Error en DeleteBloqueoEstadoUseCase:', error);
            throw new Error('Error al eliminar el bloqueo: ' + error.message);
        }
    }
}

module.exports = DeleteBloqueoEstadoUseCase;
