const GetFlujosUseCase = require('../../application/usecases/flujo/GetFlujosUseCase');
const CreateFlujoUseCase = require('../../application/usecases/flujo/CreateFlujoUseCase');
const UpdateFlujoUseCase = require('../../application/usecases/flujo/UpdateFlujoUseCase');
const ConfigurarEstadosFlujoUseCase = require('../../application/usecases/flujo/ConfigurarEstadosFlujoUseCase');

class FlujoController {
    constructor() {
        this.getFlujosUseCase = new GetFlujosUseCase();
        this.createFlujoUseCase = new CreateFlujoUseCase();
        this.updateFlujoUseCase = new UpdateFlujoUseCase();
        this.configurarEstadosFlujoUseCase = new ConfigurarEstadosFlujoUseCase();
    }

    async getAll(req, res) {
        try {
            const { activos } = req.query;
            const soloActivos = activos === 'true';

            const result = await this.getFlujosUseCase.execute(soloActivos);

            return res.status(200).json({
                success: true,
                message: 'Flujos obtenidos exitosamente',
                ...result
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Error al obtener flujos'
            });
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const FlujoRepository = require('../../infrastructure/repositories/FlujoRepository');
            const flujoRepository = new FlujoRepository();

            const flujo = await flujoRepository.findById(id);

            if (!flujo) {
                return res.status(404).json({
                    success: false,
                    message: 'Flujo no encontrado'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Flujo obtenido exitosamente',
                data: flujo.toJSON()
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Error al obtener el flujo'
            });
        }
    }

    async create(req, res) {
        try {
            const result = await this.createFlujoUseCase.execute(req.body);

            return res.status(201).json({
                success: true,
                message: 'Flujo creado exitosamente',
                ...result
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Error al crear el flujo'
            });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const result = await this.updateFlujoUseCase.execute(id, req.body);

            return res.status(200).json({
                success: true,
                message: 'Flujo actualizado exitosamente',
                ...result
            });
        } catch (error) {
            const statusCode = error.message.includes('no encontrado') ? 404 : 400;
            return res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al actualizar el flujo'
            });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const FlujoRepository = require('../../infrastructure/repositories/FlujoRepository');
            const flujoRepository = new FlujoRepository();

            const flujoExistente = await flujoRepository.findById(id);
            if (!flujoExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Flujo no encontrado'
                });
            }

            const eliminado = await flujoRepository.delete(id);

            if (!eliminado) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo eliminar el flujo'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Flujo eliminado exitosamente'
            });
        } catch (error) {
            const statusCode = error.message.includes('en uso') ? 409 : 400;
            return res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al eliminar el flujo'
            });
        }
    }

    async configurarEstados(req, res) {
        try {
            const { id } = req.params;
            const { estados } = req.body;

            const result = await this.configurarEstadosFlujoUseCase.execute(id, estados);

            return res.status(200).json({
                success: true,
                ...result
            });
        } catch (error) {
            const statusCode = error.message.includes('no encontrado') ? 404 : 400;
            return res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al configurar estados del flujo'
            });
        }
    }

    async getEstados(req, res) {
        try {
            const { id } = req.params;
            const FlujoRepository = require('../../infrastructure/repositories/FlujoRepository');
            const flujoRepository = new FlujoRepository();

            const flujoExistente = await flujoRepository.findById(id);
            if (!flujoExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Flujo no encontrado'
                });
            }

            const estados = await flujoRepository.getEstadosFlujo(id);

            return res.status(200).json({
                success: true,
                message: 'Estados del flujo obtenidos exitosamente',
                data: estados.map(e => e.toJSON()),
                total: estados.length
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Error al obtener estados del flujo'
            });
        }
    }
}

module.exports = FlujoController;
