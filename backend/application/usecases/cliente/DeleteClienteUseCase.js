const IUseCase = require('../../domain/usecases/IUseCase');
const ClienteRepository = require('../../../infrastructure/repositories/ClienteRepository');
const { getPrisma } = require('../../../infrastructure/database/db');

class DeleteClienteUseCase extends IUseCase {
    constructor() {
        super();
        this.clienteRepository = new ClienteRepository();
    }

    async execute(id) {
        try {
            // Verificar que el cliente existe
            const clienteExistente = await this.clienteRepository.findById(id);
            if (!clienteExistente) {
                throw new Error('Cliente no encontrado');
            }

            // Verificar que no tenga productos asociados
            const prisma = getPrisma();
            const productosAsociados = await prisma.productos.count({
                where: { id_cliente: parseInt(id) }
            });

            if (productosAsociados > 0) {
                throw new Error(`No se puede eliminar el cliente porque tiene ${productosAsociados} producto(s) asociado(s)`);
            }

            // Verificar que no tenga órdenes asociadas
            const ordenesAsociadas = await prisma.ordenes.count({
                where: { id_cliente: parseInt(id) }
            });

            if (ordenesAsociadas > 0) {
                throw new Error(`No se puede eliminar el cliente porque tiene ${ordenesAsociadas} orden(es) asociada(s)`);
            }

            // Eliminar cliente
            const resultado = await this.clienteRepository.delete(id);

            if (!resultado) {
                throw new Error('Error al eliminar el cliente');
            }

            return {
                data: { id_cliente: parseInt(id) },
                message: 'Cliente eliminado exitosamente'
            };
        } catch (error) {
            console.error('Error en DeleteClienteUseCase:', error);
            throw error;
        }
    }
}

module.exports = DeleteClienteUseCase;
