const IUseCase = require('../../domain/usecases/IUseCase');
const ProductoRepository = require('../../../infrastructure/repositories/ProductoRepository');
const { getPrisma } = require('../../../infrastructure/database/db');

class DeleteProductoUseCase extends IUseCase {
    constructor() {
        super();
        this.productoRepository = new ProductoRepository();
    }

    async execute(id) {
        try {
            // Verificar que el producto existe
            const productoExistente = await this.productoRepository.findById(id);
            if (!productoExistente) {
                throw new Error('Producto no encontrado');
            }

            // Verificar que no tenga órdenes asociadas
            const prisma = getPrisma();
            const ordenesAsociadas = await prisma.ordenes.count({
                where: { id_producto: parseInt(id) }
            });

            if (ordenesAsociadas > 0) {
                throw new Error(`No se puede eliminar el producto porque tiene ${ordenesAsociadas} orden(es) asociada(s)`);
            }

            // Eliminar producto
            const resultado = await this.productoRepository.delete(id);

            if (!resultado) {
                throw new Error('Error al eliminar el producto');
            }

            return {
                data: { id_producto: parseInt(id) },
                message: 'Producto eliminado exitosamente'
            };
        } catch (error) {
            console.error('Error en DeleteProductoUseCase:', error);
            throw error;
        }
    }
}

module.exports = DeleteProductoUseCase;
