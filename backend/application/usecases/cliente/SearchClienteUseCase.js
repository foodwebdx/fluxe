const IUseCase = require('../../domain/usecases/IUseCase');
const ClienteRepository = require('../../../infrastructure/repositories/ClienteRepository');

class SearchClienteUseCase extends IUseCase {
    constructor() {
        super();
        this.clienteRepository = new ClienteRepository();
    }

    async execute(query) {
        try {
            if (!query || query.trim() === '') {
                throw new Error('El parámetro de búsqueda es requerido');
            }

            // Obtener todos los clientes
            const todosLosClientes = await this.clienteRepository.findAll();

            // Normalizar query para búsqueda case-insensitive
            const queryLower = query.toLowerCase().trim();

            // Filtrar clientes que coincidan con el query
            const clientesFiltrados = todosLosClientes.filter(cliente => {
                return (
                    cliente.nombre_completo.toLowerCase().includes(queryLower) ||
                    cliente.correo_electronico.toLowerCase().includes(queryLower) ||
                    cliente.numero_identificacion.toLowerCase().includes(queryLower) ||
                    cliente.telefono_contacto.toLowerCase().includes(queryLower) ||
                    (cliente.tipo_identificacion && cliente.tipo_identificacion.toLowerCase().includes(queryLower))
                );
            });

            return {
                data: clientesFiltrados,
                count: clientesFiltrados.length,
                query: query,
                message: `Se encontraron ${clientesFiltrados.length} cliente(s)`
            };
        } catch (error) {
            console.error('Error en SearchClienteUseCase:', error);
            throw error;
        }
    }
}

module.exports = SearchClienteUseCase;
