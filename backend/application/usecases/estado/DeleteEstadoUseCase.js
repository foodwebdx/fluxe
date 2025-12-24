const IUseCase = require('../../../domain/usecases/IUseCase');
const EstadoRepository = require('../../../infrastructure/repositories/EstadoRepository');

class DeleteEstadoUseCase extends IUseCase {
    constructor() {
        super();
        this.estadoRepository = new EstadoRepository();
    }

    async execute(id) {
        try {
            // Verificar que el estado existe
            const estadoExistente = await this.estadoRepository.findById(id);
            if (!estadoExistente) {
                throw new Error('Estado no encontrado');
            }

            // Intentar eliminar (el repositorio valida si está en uso)
            const eliminado = await this.estadoRepository.delete(id);

            if (!eliminado) {
                throw new Error('No se pudo eliminar el estado');
            }

            return {
                message: 'Estado eliminado exitosamente'
            };
        } catch (error) {
            console.error('Error en DeleteEstadoUseCase:', error);
            throw new Error('Error al eliminar el estado: ' + error.message);
        }
    }
}

module.exports = DeleteEstadoUseCase;
