const IUseCase = require('../../../domain/usecases/IUseCase');
const UsuarioRepository = require('../../../infrastructure/repositories/UsuarioRepository');

class DeleteUsuarioUseCase extends IUseCase {
  constructor() {
    super();
    this.usuarioRepository = new UsuarioRepository();
  }

  async execute(id) {
    try {
      const usuarioExistente = await this.usuarioRepository.findById(id);

      if (!usuarioExistente) {
        throw new Error('Usuario no encontrado');
      }

      const eliminado = await this.usuarioRepository.delete(id);

      if (!eliminado) {
        throw new Error('Usuario no encontrado');
      }

      return {
        message: 'Usuario eliminado exitosamente',
      };
    } catch (error) {
      console.error('Error en DeleteUsuarioUseCase:', error);
      throw error;
    }
  }
}

module.exports = DeleteUsuarioUseCase;
