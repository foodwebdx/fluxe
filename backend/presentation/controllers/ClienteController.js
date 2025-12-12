const GetClientesUseCase = require('../../application/usecases/cliente/GetClientesUseCase');

class ClienteController {
  constructor() {
    this.getClientesUseCase = new GetClientesUseCase();
  }

  async getAll(req, res) {
    try {
      const result = await this.getClientesUseCase.execute();
      
      return res.status(200).json({
        success: true,
        message: 'Clientes obtenidos exitosamente',
        ...result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener clientes',
      });
    }
  }
}

module.exports = ClienteController;

