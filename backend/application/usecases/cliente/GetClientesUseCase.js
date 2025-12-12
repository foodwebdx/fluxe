const IUseCase = require('../../../domain/usecases/IUseCase');
const ClienteRepository = require('../../../infrastructure/repositories/ClienteRepository');

class GetClientesUseCase extends IUseCase {
  constructor() {
    super();
    this.clienteRepository = new ClienteRepository();
  }

  async execute() {
    try {
      const clientes = await this.clienteRepository.findAll();
      return {
        success: true,
        data: clientes,
        count: clientes.length,
      };
    } catch (error) {
      throw new Error(`Error al obtener clientes: ${error.message}`);
    }
  }
}

module.exports = GetClientesUseCase;

