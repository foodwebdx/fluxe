const GetOrdenesUseCase = require('../../application/usecases/orden/GetOrdenesUseCase');
const GetOrdenByIdUseCase = require('../../application/usecases/orden/GetOrdenByIdUseCase');
const CreateOrdenUseCase = require('../../application/usecases/orden/CreateOrdenUseCase');
const UpdateOrdenUseCase = require('../../application/usecases/orden/UpdateOrdenUseCase');
const CambiarEstadoOrdenUseCase = require('../../application/usecases/orden/CambiarEstadoOrdenUseCase');
const DeleteOrdenUseCase = require('../../application/usecases/orden/DeleteOrdenUseCase');
const OrdenRepository = require('../../infrastructure/repositories/OrdenRepository');

class OrdenController {
    constructor() {
        this.getOrdenesUseCase = new GetOrdenesUseCase();
        this.getOrdenByIdUseCase = new GetOrdenByIdUseCase();
        this.createOrdenUseCase = new CreateOrdenUseCase();
        this.updateOrdenUseCase = new UpdateOrdenUseCase();
        this.cambiarEstadoUseCase = new CambiarEstadoOrdenUseCase();
        this.deleteOrdenUseCase = new DeleteOrdenUseCase();
        this.ordenRepository = new OrdenRepository();
    }

    async getAll(req, res) {
        try {
            // Extraer filtros de query params
            const filtros = {};
            if (req.query.id_cliente) filtros.id_cliente = parseInt(req.query.id_cliente);
            if (req.query.id_estado) filtros.id_estado = parseInt(req.query.id_estado);
            if (req.query.id_flujo) filtros.id_flujo = parseInt(req.query.id_flujo);

            const result = await this.getOrdenesUseCase.execute(filtros);

            return res.status(200).json({
                success: true,
                message: 'Órdenes obtenidas exitosamente',
                ...result,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Error al obtener órdenes',
            });
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const incluirHistorial = req.query.historial !== 'false'; // Por defecto true

            const result = await this.getOrdenByIdUseCase.execute(id, incluirHistorial);

            return res.status(200).json({
                success: true,
                message: 'Orden obtenida exitosamente',
                ...result,
            });
        } catch (error) {
            const statusCode = error.message === 'Orden no encontrada' ? 404 : 500;
            return res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al obtener la orden',
            });
        }
    }

    async getByCliente(req, res) {
        try {
            const { idCliente } = req.params;
            const ordenes = await this.ordenRepository.findByCliente(idCliente);

            return res.status(200).json({
                success: true,
                message: 'Órdenes del cliente obtenidas exitosamente',
                data: ordenes,
                count: ordenes.length,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Error al obtener órdenes del cliente',
            });
        }
    }

    async getByEstado(req, res) {
        try {
            const { idEstado } = req.params;
            const ordenes = await this.ordenRepository.findByEstado(idEstado);

            return res.status(200).json({
                success: true,
                message: 'Órdenes por estado obtenidas exitosamente',
                data: ordenes,
                count: ordenes.length,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Error al obtener órdenes por estado',
            });
        }
    }

    async create(req, res) {
        try {
            const result = await this.createOrdenUseCase.execute(req.body);

            return res.status(201).json({
                success: true,
                ...result,
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Error al crear la orden',
            });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const result = await this.updateOrdenUseCase.execute(id, req.body);

            return res.status(200).json({
                success: true,
                ...result,
            });
        } catch (error) {
            const statusCode = error.message === 'Orden no encontrada' ? 404 : 400;
            return res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al actualizar la orden',
            });
        }
    }

    async cambiarEstado(req, res) {
        try {
            const { id } = req.params;
            const { id_estado, id_usuario_responsable } = req.body;

            if (!id_estado) {
                return res.status(400).json({
                    success: false,
                    message: 'El id_estado es requerido',
                });
            }

            const result = await this.cambiarEstadoUseCase.execute(
                id,
                id_estado,
                id_usuario_responsable
            );

            return res.status(200).json({
                success: true,
                ...result,
            });
        } catch (error) {
            const statusCode = error.message === 'Orden no encontrada' ? 404 : 400;
            return res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al cambiar el estado de la orden',
            });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await this.deleteOrdenUseCase.execute(id);

            return res.status(200).json({
                success: true,
                ...result,
            });
        } catch (error) {
            const statusCode = error.message === 'Orden no encontrada' ? 404 : 500;
            return res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al eliminar la orden',
            });
        }
    }
}

module.exports = OrdenController;
