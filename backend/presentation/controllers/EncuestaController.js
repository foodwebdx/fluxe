const GetEncuestasUseCase = require('../../application/usecases/encuesta/GetEncuestasUseCase');
const GetEncuestaByOrdenUseCase = require('../../application/usecases/encuesta/GetEncuestaByOrdenUseCase');
const CreateEncuestaUseCase = require('../../application/usecases/encuesta/CreateEncuestaUseCase');
const UpdateEncuestaUseCase = require('../../application/usecases/encuesta/UpdateEncuestaUseCase');
const DeleteEncuestaUseCase = require('../../application/usecases/encuesta/DeleteEncuestaUseCase');

class EncuestaController {
    constructor() {
        this.getEncuestasUseCase = new GetEncuestasUseCase();
        this.getEncuestaByOrdenUseCase = new GetEncuestaByOrdenUseCase();
        this.createEncuestaUseCase = new CreateEncuestaUseCase();
        this.updateEncuestaUseCase = new UpdateEncuestaUseCase();
        this.deleteEncuestaUseCase = new DeleteEncuestaUseCase();
    }

    async getAll(req, res) {
        try {
            const result = await this.getEncuestasUseCase.execute();

            return res.status(200).json({
                success: true,
                message: 'Encuestas obtenidas exitosamente',
                ...result
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Error al obtener encuestas'
            });
        }
    }

    async getByOrden(req, res) {
        try {
            const { idOrden } = req.params;
            const result = await this.getEncuestaByOrdenUseCase.execute(idOrden);

            return res.status(200).json({
                success: true,
                message: 'Encuesta obtenida exitosamente',
                ...result
            });
        } catch (error) {
            const statusCode = error.message.includes('no encontrada') ? 404 : 400;
            return res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al obtener la encuesta'
            });
        }
    }

    async getById(req, res) {
        req.params.idOrden = req.params.id;
        return this.getByOrden(req, res);
    }

    async create(req, res) {
        try {
            const encuestaData = {
                id_orden: req.body.id_orden,
                comentario: req.body.comentario,
                satisfaccion_servicio: req.body.satisfaccion_servicio,
                satisfaccion_tiempo: req.body.satisfaccion_tiempo,
                satisfaccion_general: req.body.satisfaccion_general,
                fecha_respuesta: req.body.fecha_respuesta
            };

            const result = await this.createEncuestaUseCase.execute(encuestaData);

            return res.status(201).json({
                success: true,
                message: 'Encuesta creada exitosamente',
                ...result
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Error al crear la encuesta'
            });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const result = await this.updateEncuestaUseCase.execute(id, req.body);

            return res.status(200).json({
                success: true,
                message: 'Encuesta actualizada exitosamente',
                ...result
            });
        } catch (error) {
            const statusCode = error.message.includes('no encontrada') ? 404 : 400;
            return res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al actualizar la encuesta'
            });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await this.deleteEncuestaUseCase.execute(id);

            return res.status(200).json({
                success: true,
                ...result
            });
        } catch (error) {
            const statusCode = error.message.includes('no encontrada') ? 404 : 400;
            return res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al eliminar la encuesta'
            });
        }
    }
}

module.exports = EncuestaController;
