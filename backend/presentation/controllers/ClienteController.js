const GetClientesUseCase = require('../../application/usecases/cliente/GetClientesUseCase');
const CreateClienteUseCase = require('../../application/usecases/cliente/CreateClienteUseCase');
const UpdateClienteUseCase = require('../../application/usecases/cliente/UpdateClienteUseCase');
const DeleteClienteUseCase = require('../../application/usecases/cliente/DeleteClienteUseCase');
const SearchClienteUseCase = require('../../application/usecases/cliente/SearchClienteUseCase');
const ClienteRepository = require('../../infrastructure/repositories/ClienteRepository');

class ClienteController {
  constructor() {
    this.getClientesUseCase = new GetClientesUseCase();
    this.createClienteUseCase = new CreateClienteUseCase();
    this.updateClienteUseCase = new UpdateClienteUseCase();
    this.deleteClienteUseCase = new DeleteClienteUseCase();
    this.searchClienteUseCase = new SearchClienteUseCase();
    this.clienteRepository = new ClienteRepository();
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

  async getById(req, res) {
    try {
      const { id } = req.params;
      const cliente = await this.clienteRepository.findById(id);

      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Cliente obtenido exitosamente',
        data: cliente,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener el cliente',
      });
    }
  }

  async create(req, res) {
    try {
      const result = await this.createClienteUseCase.execute(req.body);

      return res.status(201).json({
        success: true,
        ...result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al crear el cliente',
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const result = await this.updateClienteUseCase.execute(id, req.body);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      const statusCode = error.message === 'Cliente no encontrado' ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al actualizar el cliente',
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await this.deleteClienteUseCase.execute(id);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      const statusCode = error.message === 'Cliente no encontrado' ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al eliminar el cliente',
      });
    }
  }

  async search(req, res) {
    try {
      const { q } = req.query;
      const result = await this.searchClienteUseCase.execute(q);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al buscar clientes',
      });
    }
  }
}

module.exports = ClienteController;

