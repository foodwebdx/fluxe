const IUseCase = require('../../../domain/usecases/IUseCase');
const RolRepository = require('../../../infrastructure/repositories/RolRepository');

class DeleteRolUseCase extends IUseCase {
  constructor() {
    super();
    this.rolRepository = new RolRepository();
  }

  async execute(id) {
    try {
      const rolExistente = await this.rolRepository.findById(id);

      if (!rolExistente) {
        throw new Error('Rol no encontrado');
      }

      const eliminado = await this.rolRepository.delete(id);

      if (!eliminado) {
        throw new Error('Rol no encontrado');
      }

      return {
        message: 'Rol eliminado exitosamente',
      };
    } catch (error) {
      console.error('Error en DeleteRolUseCase:', error);
      throw error;
    }
  }
}

module.exports = DeleteRolUseCase;
