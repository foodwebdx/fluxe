const GetBloqueosEstadoUseCase = require('../../application/usecases/bloqueo/GetBloqueosEstadoUseCase');
const GetBloqueosByHistorialUseCase = require('../../application/usecases/bloqueo/GetBloqueosByHistorialUseCase');
const GetBloqueosByOrdenUseCase = require('../../application/usecases/bloqueo/GetBloqueosByOrdenUseCase');
const CreateBloqueoEstadoUseCase = require('../../application/usecases/bloqueo/CreateBloqueoEstadoUseCase');
const UpdateBloqueoEstadoUseCase = require('../../application/usecases/bloqueo/UpdateBloqueoEstadoUseCase');
const DeleteBloqueoEstadoUseCase = require('../../application/usecases/bloqueo/DeleteBloqueoEstadoUseCase');

class BloqueoEstadoController {
    constructor() {
        this.getBloqueosEstadoUseCase = new GetBloqueosEstadoUseCase();
        this.getBloqueosByHistorialUseCase = new GetBloqueosByHistorialUseCase();
        this.getBloqueosByOrdenUseCase = new GetBloqueosByOrdenUseCase();
        this.createBloqueoUseCase = new CreateBloqueoEstadoUseCase();
        this.updateBloqueoUseCase = new UpdateBloqueoEstadoUseCase();
        this.deleteBloqueoUseCase = new DeleteBloqueoEstadoUseCase();
    }

    async getAll(req, res) {
        try {
            const result = await this.getBloqueosEstadoUseCase.execute();

            return res.status(200).json({
                success: true,
                message: 'Bloqueos obtenidos exitosamente',
                ...result
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Error al obtener bloqueos'
            });
        }
    }

    async getByHistorial(req, res) {
        try {
            const { idHistorial } = req.params;
            const result = await this.getBloqueosByHistorialUseCase.execute(idHistorial);

            return res.status(200).json({
                success: true,
                message: 'Bloqueos del historial obtenidos exitosamente',
                ...result
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Error al obtener bloqueos del historial'
            });
        }
    }

    async getByOrden(req, res) {
        try {
            const { idOrden } = req.params;
            const result = await this.getBloqueosByOrdenUseCase.execute(idOrden);

            return res.status(200).json({
                success: true,
                message: 'Bloqueos de la orden obtenidos exitosamente',
                ...result
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Error al obtener bloqueos de la orden'
            });
        }
    }

    async create(req, res) {
        try {
            const result = await this.createBloqueoUseCase.execute(req.body);

            return res.status(201).json({
                success: true,
                message: 'Bloqueo creado exitosamente',
                ...result
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Error al crear el bloqueo'
            });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const result = await this.updateBloqueoUseCase.execute(id, req.body);

            return res.status(200).json({
                success: true,
                message: 'Bloqueo actualizado exitosamente',
                ...result
            });
        } catch (error) {
            const statusCode = error.message.includes('no encontrado') ? 404 : 400;
            return res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al actualizar el bloqueo'
            });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await this.deleteBloqueoUseCase.execute(id);

            return res.status(200).json({
                success: true,
                ...result
            });
        } catch (error) {
            const statusCode = error.message.includes('no encontrado') ? 404 : 400;
            return res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al eliminar el bloqueo'
            });
        }
    }
}

module.exports = BloqueoEstadoController;
