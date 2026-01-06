const IUseCase = require('../../../domain/usecases/IUseCase');
const UsuarioRepository = require('../../../infrastructure/repositories/UsuarioRepository');

class UpdateUsuarioUseCase extends IUseCase {
  constructor() {
    super();
    this.usuarioRepository = new UsuarioRepository();
  }

  async execute(id, usuarioData) {
    try {
      const usuarioExistente = await this.usuarioRepository.findById(id);

      if (!usuarioExistente) {
        throw new Error('Usuario no encontrado');
      }

      if (usuarioData.email) {
        const usuarios = await this.usuarioRepository.findAll();
        const emailExiste = usuarios.some(
          (usuario) =>
            usuario.email &&
            usuario.email.toLowerCase() === usuarioData.email.toLowerCase() &&
            usuario.id_usuario !== parseInt(id)
        );

        if (emailExiste) {
          throw new Error('Ya existe un usuario con ese email');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(usuarioData.email)) {
          throw new Error('El formato del email no es valido');
        }
      }

      if (usuarioData.usuario_login) {
        const usuarios = await this.usuarioRepository.findAll();
        const loginExiste = usuarios.some(
          (usuario) =>
            usuario.usuario_login &&
            usuario.usuario_login.toLowerCase() === usuarioData.usuario_login.toLowerCase() &&
            usuario.id_usuario !== parseInt(id)
        );

        if (loginExiste) {
          throw new Error('Ya existe un usuario con ese login');
        }
      }

      const usuarioActualizado = await this.usuarioRepository.update(id, usuarioData);

      if (!usuarioActualizado) {
        throw new Error('Usuario no encontrado');
      }

      return {
        data: usuarioActualizado,
        message: 'Usuario actualizado exitosamente',
      };
    } catch (error) {
      console.error('Error en UpdateUsuarioUseCase:', error);
      throw error;
    }
  }
}

module.exports = UpdateUsuarioUseCase;
