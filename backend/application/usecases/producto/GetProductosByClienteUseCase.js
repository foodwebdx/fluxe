const IUseCase = require('../../../domain/usecases/IUseCase');
const ProductoRepository = require('../../../infrastructure/repositories/ProductoRepository');
const ClienteRepository = require('../../../infrastructure/repositories/ClienteRepository');

class GetProductosByClienteUseCase extends IUseCase {
    constructor() {
        super();
        this.productoRepository = new ProductoRepository();
        this.clienteRepository = new ClienteRepository();
    }

    async execute(idCliente) {
        try {
            // Verificar que el cliente existe
            const cliente = await this.clienteRepository.findById(idCliente);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            const productos = await this.productoRepository.findByCliente(idCliente);

            return {
                data: productos,
                count: productos.length,
                cliente: {
                    id_cliente: cliente.id_cliente,
                    nombre_completo: cliente.nombre_completo
                }
            };
        } catch (error) {
            console.error('Error en GetProductosByClienteUseCase:', error);
            throw error;
        }
    }
}

module.exports = GetProductosByClienteUseCase;
