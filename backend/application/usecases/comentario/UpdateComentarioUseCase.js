const IUseCase = require('../../../domain/usecases/IUseCase');
const ComentarioEstadoRepository = require('../../../infrastructure/repositories/ComentarioEstadoRepository');

class UpdateComentarioUseCase extends IUseCase {
    constructor() {
        super();
        this.comentarioRepository = new ComentarioEstadoRepository();
    }

    async execute(id, comentarioData) {
        try {
            if (!id) {
                throw new Error('El ID del comentario es requerido');
            }

            // Verificar que el comentario existe
            const comentarioExistente = await this.comentarioRepository.findById(id);
            if (!comentarioExistente) {
                throw new Error('Comentario no encontrado');
            }

            // Actualizar el comentario
            const comentarioActualizado = await this.comentarioRepository.update(id, comentarioData);

            return {
                data: comentarioActualizado
            };
        } catch (error) {
            console.error('Error en UpdateComentarioUseCase:', error);
            throw new Error('Error al actualizar el comentario: ' + error.message);
        }
    }
}

module.exports = UpdateComentarioUseCase;
