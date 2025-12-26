const IUseCase = require('../../../domain/usecases/IUseCase');
const ComentarioEstadoRepository = require('../../../infrastructure/repositories/ComentarioEstadoRepository');

class DeleteComentarioUseCase extends IUseCase {
    constructor() {
        super();
        this.comentarioRepository = new ComentarioEstadoRepository();
    }

    async execute(id) {
        try {
            if (!id) {
                throw new Error('El ID del comentario es requerido');
            }

            // Verificar que el comentario existe
            const comentarioExistente = await this.comentarioRepository.findById(id);
            if (!comentarioExistente) {
                throw new Error('Comentario no encontrado');
            }

            // Eliminar el comentario
            await this.comentarioRepository.delete(id);

            return {
                message: 'Comentario eliminado exitosamente'
            };
        } catch (error) {
            console.error('Error en DeleteComentarioUseCase:', error);
            throw new Error('Error al eliminar el comentario: ' + error.message);
        }
    }
}

module.exports = DeleteComentarioUseCase;
