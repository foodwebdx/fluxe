const IUseCase = require('../../../domain/usecases/IUseCase');
const ComentarioEstadoRepository = require('../../../infrastructure/repositories/ComentarioEstadoRepository');

class GetComentariosUseCase extends IUseCase {
    constructor() {
        super();
        this.comentarioRepository = new ComentarioEstadoRepository();
    }

    async execute() {
        try {
            const comentarios = await this.comentarioRepository.findAll();

            return {
                data: comentarios,
                total: comentarios.length
            };
        } catch (error) {
            console.error('Error en GetComentariosUseCase:', error);
            throw new Error('Error al obtener los comentarios: ' + error.message);
        }
    }
}

module.exports = GetComentariosUseCase;
