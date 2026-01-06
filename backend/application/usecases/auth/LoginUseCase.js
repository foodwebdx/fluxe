const IUseCase = require('../../../domain/usecases/IUseCase');
const UsuarioRepository = require('../../../infrastructure/repositories/UsuarioRepository');

class LoginUseCase extends IUseCase {
  constructor() {
    super();
    this.usuarioRepository = new UsuarioRepository();
  }

  async execute({ usuario_login, password }) {
    try {
      if (!usuario_login || !password) {
        throw new Error('Usuario y contrasena son requeridos');
      }

      const usuario = await this.usuarioRepository.findByLoginWithPassword(usuario_login);

      if (!usuario || !usuario.hash_password || usuario.hash_password !== password) {
        throw new Error('Credenciales invalidas');
      }

      const usuarioSeguro = this.usuarioRepository.formatUsuario(usuario);

      return {
        user: usuarioSeguro,
      };
    } catch (error) {
      console.error('Error en LoginUseCase:', error);
      throw error;
    }
  }
}

module.exports = LoginUseCase;
