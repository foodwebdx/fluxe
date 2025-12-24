const IUseCase = require('../../../domain/usecases/IUseCase');
const EstadoRepository = require('../../../infrastructure/repositories/EstadoRepository');

class UpdateEstadoUseCase extends IUseCase {
    constructor() {
        super();
        this.estadoRepository = new EstadoRepository();
    }

    async execute(id, estadoData) {
        try {
            // Verificar que el estado existe
            const estadoExistente = await this.estadoRepository.findById(id);
            if (!estadoExistente) {
                throw new Error('Estado no encontrado');
            }

            // Actualizar
            const estadoActualizado = await this.estadoRepository.update(id, estadoData);

            if (!estadoActualizado) {
                throw new Error('No se pudo actualizar el estado');
            }

            return {
                data: estadoActualizado.toJSON()
            };
        } catch (error) {
            console.error('Error en UpdateEstadoUseCase:', error);
            throw new Error('Error al actualizar el estado: ' + error.message);
        }
    }
}

module.exports = UpdateEstadoUseCase;
