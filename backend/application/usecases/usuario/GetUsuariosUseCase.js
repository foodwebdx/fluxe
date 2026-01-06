const IUseCase = require('../../../domain/usecases/IUseCase');
const UsuarioRepository = require('../../../infrastructure/repositories/UsuarioRepository');

class GetUsuariosUseCase extends IUseCase {
  constructor() {
    super();
    this.usuarioRepository = new UsuarioRepository();
  }

  async execute() {
    try {
      const usuarios = await this.usuarioRepository.findAll();
      return {
        success: true,
        data: usuarios,
        count: usuarios.length,
      };
    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
  }
}

module.exports = GetUsuariosUseCase;
