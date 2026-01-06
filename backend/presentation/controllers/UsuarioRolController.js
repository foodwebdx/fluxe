const UsuarioRolRepository = require('../../infrastructure/repositories/UsuarioRolRepository');

class UsuarioRolController {
  constructor() {
    this.usuarioRolRepository = new UsuarioRolRepository();
  }

  async getAll(req, res) {
    try {
      const assignments = await this.usuarioRolRepository.findAll();

      return res.status(200).json({
        success: true,
        message: 'Usuarios roles obtenidos exitosamente',
        data: assignments,
        count: assignments.length,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener usuarios roles',
      });
    }
  }

  async getByUsuario(req, res) {
    try {
      const { idUsuario } = req.params;
      const roles = await this.usuarioRolRepository.findByUsuario(idUsuario);

      return res.status(200).json({
        success: true,
        message: 'Roles del usuario obtenidos exitosamente',
        data: roles,
        count: roles.length,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener roles del usuario',
      });
    }
  }

  async create(req, res) {
    try {
      const { id_usuario, id_rol } = req.body;

      if (!id_usuario || !id_rol) {
        return res.status(400).json({
          success: false,
          message: 'id_usuario y id_rol son requeridos',
        });
      }

      const assignment = await this.usuarioRolRepository.create({ id_usuario, id_rol });

      return res.status(201).json({
        success: true,
        message: 'Rol asignado al usuario exitosamente',
        data: assignment,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al asignar rol al usuario',
      });
    }
  }

  async delete(req, res) {
    try {
      const { idUsuario, idRol } = req.params;

      const deleted = await this.usuarioRolRepository.delete(idUsuario, idRol);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Relacion usuario-rol no encontrada',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Rol removido del usuario exitosamente',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error al eliminar rol del usuario',
      });
    }
  }
}

module.exports = UsuarioRolController;
