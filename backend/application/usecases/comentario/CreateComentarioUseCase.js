const IUseCase = require('../../../domain/usecases/IUseCase');
const ComentarioEstadoRepository = require('../../../infrastructure/repositories/ComentarioEstadoRepository');
const ComentarioEstado = require('../../../domain/entities/ComentarioEstado');

class CreateComentarioUseCase extends IUseCase {
    constructor() {
        super();
        this.comentarioRepository = new ComentarioEstadoRepository();
    }

    async execute(comentarioData) {
        try {
            // Crear entidad para validar
            const comentario = new ComentarioEstado(comentarioData);

            // Validar entidad
            const errors = comentario.validate();
            if (errors.length > 0) {
                throw new Error('Errores de validación: ' + errors.join(', '));
            }

            // Crear en la base de datos
            const nuevoComentario = await this.comentarioRepository.create(comentarioData);

            return {
                data: nuevoComentario
            };
        } catch (error) {
            console.error('Error en CreateComentarioUseCase:', error);
            throw new Error('Error al crear el comentario: ' + error.message);
        }
    }
}

module.exports = CreateComentarioUseCase;
