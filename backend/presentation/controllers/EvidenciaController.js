const GetEvidenciasUseCase = require('../../application/usecases/evidencia/GetEvidenciasUseCase');
const GetEvidenciasByOrdenUseCase = require('../../application/usecases/evidencia/GetEvidenciasByOrdenUseCase');
const CreateEvidenciaUseCase = require('../../application/usecases/evidencia/CreateEvidenciaUseCase');
const UpdateEvidenciaUseCase = require('../../application/usecases/evidencia/UpdateEvidenciaUseCase');
const DeleteEvidenciaUseCase = require('../../application/usecases/evidencia/DeleteEvidenciaUseCase');

class EvidenciaController {
    constructor() {
        this.getEvidenciasUseCase = new GetEvidenciasUseCase();
        this.getEvidenciasByOrdenUseCase = new GetEvidenciasByOrdenUseCase();
        this.createEvidenciaUseCase = new CreateEvidenciaUseCase();
        this.updateEvidenciaUseCase = new UpdateEvidenciaUseCase();
        this.deleteEvidenciaUseCase = new DeleteEvidenciaUseCase();
    }

    async getAll(req, res) {
        try {
            const result = await this.getEvidenciasUseCase.execute();

            return res.status(200).json({
                success: true,
                message: 'Evidencias obtenidas exitosamente',
                ...result
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Error al obtener evidencias'
            });
        }
    }

    async getByOrden(req, res) {
        try {
            const { idOrden } = req.params;
            const result = await this.getEvidenciasByOrdenUseCase.execute(idOrden);

            return res.status(200).json({
                success: true,
                message: 'Evidencias de la orden obtenidas exitosamente',
                ...result
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Error al obtener las evidencias de la orden'
            });
        }
    }

    async create(req, res) {
        try {
            const result = await this.createEvidenciaUseCase.execute(req.body);

            return res.status(201).json({
                success: true,
                message: 'Evidencia creada exitosamente',
                ...result
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Error al crear la evidencia'
            });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const result = await this.updateEvidenciaUseCase.execute(id, req.body);

            return res.status(200).json({
                success: true,
                message: 'Evidencia actualizada exitosamente',
                ...result
            });
        } catch (error) {
            const statusCode = error.message.includes('no encontrada') ? 404 : 400;
            return res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al actualizar la evidencia'
            });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await this.deleteEvidenciaUseCase.execute(id);

            return res.status(200).json({
                success: true,
                ...result
            });
        } catch (error) {
            const statusCode = error.message.includes('no encontrada') ? 404 : 400;
            return res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al eliminar la evidencia'
            });
        }
    }
}

module.exports = EvidenciaController;
