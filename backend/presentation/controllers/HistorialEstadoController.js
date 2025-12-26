const GetHistorialUseCase = require('../../application/usecases/historial/GetHistorialUseCase');
const GetHistorialByIdUseCase = require('../../application/usecases/historial/GetHistorialByIdUseCase');
const GetHistorialPorOrdenUseCase = require('../../application/usecases/historial/GetHistorialPorOrdenUseCase');

class HistorialEstadoController {
    constructor() {
        this.getHistorialUseCase = new GetHistorialUseCase();
        this.getHistorialByIdUseCase = new GetHistorialByIdUseCase();
        this.getHistorialPorOrdenUseCase = new GetHistorialPorOrdenUseCase();
    }

    async getAll(req, res) {
        try {
            const result = await this.getHistorialUseCase.execute();

            return res.status(200).json({
                success: true,
                message: 'Historial de estados obtenido exitosamente',
                ...result
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Error al obtener el historial de estados'
            });
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const result = await this.getHistorialByIdUseCase.execute(id);

            return res.status(200).json({
                success: true,
                message: 'Historial obtenido exitosamente',
                ...result
            });
        } catch (error) {
            const statusCode = error.message.includes('no encontrado') ? 404 : 500;
            return res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al obtener el historial'
            });
        }
    }

    async getByOrden(req, res) {
        try {
            const { idOrden } = req.params;
            const result = await this.getHistorialPorOrdenUseCase.execute(idOrden);

            return res.status(200).json({
                success: true,
                message: 'Historial de la orden obtenido exitosamente',
                ...result
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Error al obtener el historial de la orden'
            });
        }
    }
}

module.exports = HistorialEstadoController;
