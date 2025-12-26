const IUseCase = require('../../../domain/usecases/IUseCase');
const ComentarioEstadoRepository = require('../../../infrastructure/repositories/ComentarioEstadoRepository');

class GetComentariosByHistorialUseCase extends IUseCase {
    constructor() {
        super();
        this.comentarioRepository = new ComentarioEstadoRepository();
    }

    async execute(idHistorial) {
        try {
            if (!idHistorial) {
                throw new Error('El ID del historial es requerido');
            }

            const comentarios = await this.comentarioRepository.findByHistorial(idHistorial);

            return {
                data: comentarios,
                total: comentarios.length
            };
        } catch (error) {
            console.error('Error en GetComentariosByHistorialUseCase:', error);
            throw new Error('Error al obtener los comentarios del historial: ' + error.message);
        }
    }
}

module.exports = GetComentariosByHistorialUseCase;
