const GetProductosUseCase = require('../../application/usecases/producto/GetProductosUseCase');
const GetProductosByClienteUseCase = require('../../application/usecases/producto/GetProductosByClienteUseCase');
const CreateProductoUseCase = require('../../application/usecases/producto/CreateProductoUseCase');
const UpdateProductoUseCase = require('../../application/usecases/producto/UpdateProductoUseCase');
const DeleteProductoUseCase = require('../../application/usecases/producto/DeleteProductoUseCase');
const ProductoRepository = require('../../infrastructure/repositories/ProductoRepository');

class ProductoController {
    constructor() {
        this.getProductosUseCase = new GetProductosUseCase();
        this.getProductosByClienteUseCase = new GetProductosByClienteUseCase();
        this.createProductoUseCase = new CreateProductoUseCase();
        this.updateProductoUseCase = new UpdateProductoUseCase();
        this.deleteProductoUseCase = new DeleteProductoUseCase();
        this.productoRepository = new ProductoRepository();
    }

    async getAll(req, res) {
        try {
            const result = await this.getProductosUseCase.execute();

            return res.status(200).json({
                success: true,
                message: 'Productos obtenidos exitosamente',
                ...result,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Error al obtener productos',
            });
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const producto = await this.productoRepository.findById(id);

            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Producto obtenido exitosamente',
                data: producto,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Error al obtener el producto',
            });
        }
    }

    async getByCliente(req, res) {
        try {
            const { idCliente } = req.params;
            const result = await this.getProductosByClienteUseCase.execute(idCliente);

            return res.status(200).json({
                success: true,
                message: 'Productos del cliente obtenidos exitosamente',
                ...result,
            });
        } catch (error) {
            const statusCode = error.message === 'Cliente no encontrado' ? 404 : 500;
            return res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al obtener productos del cliente',
            });
        }
    }

    async create(req, res) {
        try {
            const result = await this.createProductoUseCase.execute(req.body);

            return res.status(201).json({
                success: true,
                ...result,
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Error al crear el producto',
            });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const result = await this.updateProductoUseCase.execute(id, req.body);

            return res.status(200).json({
                success: true,
                ...result,
            });
        } catch (error) {
            const statusCode = error.message === 'Producto no encontrado' ? 404 : 400;
            return res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al actualizar el producto',
            });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await this.deleteProductoUseCase.execute(id);

            return res.status(200).json({
                success: true,
                ...result,
            });
        } catch (error) {
            const statusCode = error.message === 'Producto no encontrado' ? 404 : 400;
            return res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al eliminar el producto',
            });
        }
    }
}

module.exports = ProductoController;
