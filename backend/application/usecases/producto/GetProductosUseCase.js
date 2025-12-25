const IUseCase = require('../../domain/usecases/IUseCase');
const ProductoRepository = require('../../../infrastructure/repositories/ProductoRepository');

class GetProductosUseCase extends IUseCase {
    constructor() {
        super();
        this.productoRepository = new ProductoRepository();
    }

    async execute() {
        try {
            const productos = await this.productoRepository.findAll();

            return {
                data: productos,
                count: productos.length,
            };
        } catch (error) {
            console.error('Error en GetProductosUseCase:', error);
            throw error;
        }
    }
}

module.exports = GetProductosUseCase;
