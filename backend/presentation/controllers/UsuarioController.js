const GetUsuariosUseCase = require('../../application/usecases/usuario/GetUsuariosUseCase');
const CreateUsuarioUseCase = require('../../application/usecases/usuario/CreateUsuarioUseCase');
const UpdateUsuarioUseCase = require('../../application/usecases/usuario/UpdateUsuarioUseCase');
const DeleteUsuarioUseCase = require('../../application/usecases/usuario/DeleteUsuarioUseCase');
const UsuarioRepository = require('../../infrastructure/repositories/UsuarioRepository');

class UsuarioController {
  constructor() {
    this.getUsuariosUseCase = new GetUsuariosUseCase();
    this.createUsuarioUseCase = new CreateUsuarioUseCase();
    this.updateUsuarioUseCase = new UpdateUsuarioUseCase();
    this.deleteUsuarioUseCase = new DeleteUsuarioUseCase();
    this.usuarioRepository = new UsuarioRepository();
  }

  async getAll(req, res) {
    try {
      const result = await this.getUsuariosUseCase.execute();

      return res.status(200).json({
        success: true,
        message: 'Usuarios obtenidos exitosamente',
        ...result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener usuarios',
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const usuario = await this.usuarioRepository.findById(id);

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Usuario obtenido exitosamente',
        data: usuario,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener usuario',
      });
    }
  }

  async create(req, res) {
    try {
      const result = await this.createUsuarioUseCase.execute(req.body);

      return res.status(201).json({
        success: true,
        ...result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al crear usuario',
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const result = await this.updateUsuarioUseCase.execute(id, req.body);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      const statusCode = error.message.includes('no encontrado') ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al actualizar usuario',
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await this.deleteUsuarioUseCase.execute(id);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      const statusCode = error.message.includes('no encontrado') ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al eliminar usuario',
      });
    }
  }
}

module.exports = UsuarioController;
