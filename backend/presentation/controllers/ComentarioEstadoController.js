const GetComentariosUseCase = require('../../application/usecases/comentario/GetComentariosUseCase');
const GetComentariosByHistorialUseCase = require('../../application/usecases/comentario/GetComentariosByHistorialUseCase');
const CreateComentarioUseCase = require('../../application/usecases/comentario/CreateComentarioUseCase');
const UpdateComentarioUseCase = require('../../application/usecases/comentario/UpdateComentarioUseCase');
const DeleteComentarioUseCase = require('../../application/usecases/comentario/DeleteComentarioUseCase');

class ComentarioEstadoController {
    constructor() {
        this.getComentariosUseCase = new GetComentariosUseCase();
        this.getComentariosByHistorialUseCase = new GetComentariosByHistorialUseCase();
        this.createComentarioUseCase = new CreateComentarioUseCase();
        this.updateComentarioUseCase = new UpdateComentarioUseCase();
        this.deleteComentarioUseCase = new DeleteComentarioUseCase();
    }

    async getAll(req, res) {
        try {
            const result = await this.getComentariosUseCase.execute();

            return res.status(200).json({
                success: true,
                message: 'Comentarios obtenidos exitosamente',
                ...result
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Error al obtener comentarios'
            });
        }
    }

    async getByHistorial(req, res) {
        try {
            const { idHistorial } = req.params;
            const result = await this.getComentariosByHistorialUseCase.execute(idHistorial);

            return res.status(200).json({
                success: true,
                message: 'Comentarios del historial obtenidos exitosamente',
                ...result
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Error al obtener los comentarios del historial'
            });
        }
    }

    async create(req, res) {
        try {
            const result = await this.createComentarioUseCase.execute(req.body);

            return res.status(201).json({
                success: true,
                message: 'Comentario creado exitosamente',
                ...result
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Error al crear el comentario'
            });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const result = await this.updateComentarioUseCase.execute(id, req.body);

            return res.status(200).json({
                success: true,
                message: 'Comentario actualizado exitosamente',
                ...result
            });
        } catch (error) {
            const statusCode = error.message.includes('no encontrado') ? 404 : 400;
            return res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al actualizar el comentario'
            });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await this.deleteComentarioUseCase.execute(id);

            return res.status(200).json({
                success: true,
                ...result
            });
        } catch (error) {
            const statusCode = error.message.includes('no encontrado') ? 404 : 400;
            return res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al eliminar el comentario'
            });
        }
    }
}

module.exports = ComentarioEstadoController;
