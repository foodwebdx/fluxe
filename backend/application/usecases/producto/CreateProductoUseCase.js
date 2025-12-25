const IUseCase = require('../../../domain/usecases/IUseCase');
const ProductoRepository = require('../../../infrastructure/repositories/ProductoRepository');
const ClienteRepository = require('../../../infrastructure/repositories/ClienteRepository');

class CreateProductoUseCase extends IUseCase {
    constructor() {
        super();
        this.productoRepository = new ProductoRepository();
        this.clienteRepository = new ClienteRepository();
    }

    async execute(productoData) {
        try {
            // Validaciones
            this.validateProductoData(productoData);

            // Verificar que el cliente existe
            const cliente = await this.clienteRepository.findById(productoData.id_cliente);
            if (!cliente) {
                throw new Error('El cliente especificado no existe');
            }

            // Crear producto
            const nuevoProducto = await this.productoRepository.create(productoData);

            return {
                data: nuevoProducto,
                message: 'Producto creado exitosamente'
            };
        } catch (error) {
            console.error('Error en CreateProductoUseCase:', error);
            throw error;
        }
    }

    validateProductoData(data) {
        const requiredFields = ['id_cliente', 'nombre_producto'];

        for (const field of requiredFields) {
            if (!data[field] || data[field].toString().trim() === '') {
                throw new Error(`El campo ${field} es requerido`);
            }
        }
    }
}

module.exports = CreateProductoUseCase;
