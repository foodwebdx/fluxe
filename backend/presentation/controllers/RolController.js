const GetRolesUseCase = require('../../application/usecases/rol/GetRolesUseCase');
const CreateRolUseCase = require('../../application/usecases/rol/CreateRolUseCase');
const UpdateRolUseCase = require('../../application/usecases/rol/UpdateRolUseCase');
const DeleteRolUseCase = require('../../application/usecases/rol/DeleteRolUseCase');
const RolRepository = require('../../infrastructure/repositories/RolRepository');

class RolController {
  constructor() {
    this.getRolesUseCase = new GetRolesUseCase();
    this.createRolUseCase = new CreateRolUseCase();
    this.updateRolUseCase = new UpdateRolUseCase();
    this.deleteRolUseCase = new DeleteRolUseCase();
    this.rolRepository = new RolRepository();
  }

  async getAll(req, res) {
    try {
      const result = await this.getRolesUseCase.execute();

      return res.status(200).json({
        success: true,
        message: 'Roles obtenidos exitosamente',
        ...result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener roles',
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const rol = await this.rolRepository.findById(id);

      if (!rol) {
        return res.status(404).json({
          success: false,
          message: 'Rol no encontrado',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Rol obtenido exitosamente',
        data: rol,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener rol',
      });
    }
  }

  async create(req, res) {
    try {
      const result = await this.createRolUseCase.execute(req.body);

      return res.status(201).json({
        success: true,
        ...result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al crear rol',
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const result = await this.updateRolUseCase.execute(id, req.body);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      const statusCode = error.message.includes('no encontrado') ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al actualizar rol',
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await this.deleteRolUseCase.execute(id);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      const statusCode = error.message.includes('no encontrado') ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al eliminar rol',
      });
    }
  }
}

module.exports = RolController;
