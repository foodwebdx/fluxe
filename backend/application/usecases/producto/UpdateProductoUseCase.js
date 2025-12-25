const IUseCase = require('../../domain/usecases/IUseCase');
const ProductoRepository = require('../../../infrastructure/repositories/ProductoRepository');

class UpdateProductoUseCase extends IUseCase {
    constructor() {
        super();
        this.productoRepository = new ProductoRepository();
    }

    async execute(id, productoData) {
        try {
            // Verificar que el producto existe
            const productoExistente = await this.productoRepository.findById(id);
            if (!productoExistente) {
                throw new Error('Producto no encontrado');
            }

            // Validar que al menos haya un campo para actualizar
            if (Object.keys(productoData).length === 0) {
                throw new Error('No hay datos para actualizar');
            }

            // Actualizar producto
            const productoActualizado = await this.productoRepository.update(id, productoData);

            if (!productoActualizado) {
                throw new Error('Error al actualizar el producto');
            }

            return {
                data: productoActualizado,
                message: 'Producto actualizado exitosamente'
            };
        } catch (error) {
            console.error('Error en UpdateProductoUseCase:', error);
            throw error;
        }
    }
}

module.exports = UpdateProductoUseCase;
