const GetEstadosUseCase = require('../../application/usecases/estado/GetEstadosUseCase');
const CreateEstadoUseCase = require('../../application/usecases/estado/CreateEstadoUseCase');
const UpdateEstadoUseCase = require('../../application/usecases/estado/UpdateEstadoUseCase');
const DeleteEstadoUseCase = require('../../application/usecases/estado/DeleteEstadoUseCase');

class EstadoController {
    constructor() {
        this.getEstadosUseCase = new GetEstadosUseCase();
        this.createEstadoUseCase = new CreateEstadoUseCase();
        this.updateEstadoUseCase = new UpdateEstadoUseCase();
        this.deleteEstadoUseCase = new DeleteEstadoUseCase();
    }

    async getAll(req, res) {
        try {
            const result = await this.getEstadosUseCase.execute();

            return res.status(200).json({
                success: true,
                message: 'Estados obtenidos exitosamente',
                ...result
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Error al obtener estados'
            });
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const EstadoRepository = require('../../infrastructure/repositories/EstadoRepository');
            const estadoRepository = new EstadoRepository();

            const estado = await estadoRepository.findById(id);

            if (!estado) {
                return res.status(404).json({
                    success: false,
                    message: 'Estado no encontrado'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Estado obtenido exitosamente',
                data: estado.toJSON()
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Error al obtener el estado'
            });
        }
    }

    async create(req, res) {
        try {
            const result = await this.createEstadoUseCase.execute(req.body);

            return res.status(201).json({
                success: true,
                message: 'Estado creado exitosamente',
                ...result
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Error al crear el estado'
            });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const result = await this.updateEstadoUseCase.execute(id, req.body);

            return res.status(200).json({
                success: true,
                message: 'Estado actualizado exitosamente',
                ...result
            });
        } catch (error) {
            const statusCode = error.message.includes('no encontrado') ? 404 : 400;
            return res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al actualizar el estado'
            });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await this.deleteEstadoUseCase.execute(id);

            return res.status(200).json({
                success: true,
                ...result
            });
        } catch (error) {
            const statusCode = error.message.includes('no encontrado') ? 404 :
                error.message.includes('en uso') ? 409 : 400;
            return res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al eliminar el estado'
            });
        }
    }
}

module.exports = EstadoController;
