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

            // Auto-generar identificador_interno si no fue proporcionado
            if (!productoData.identificador_interno || productoData.identificador_interno.trim() === '') {
                productoData.identificador_interno = this.generateIdentificadorInterno();
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

    generateIdentificadorInterno() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `PROD-${timestamp}-${random}`;
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
