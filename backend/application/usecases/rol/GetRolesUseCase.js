const IUseCase = require('../../../domain/usecases/IUseCase');
const RolRepository = require('../../../infrastructure/repositories/RolRepository');

class GetRolesUseCase extends IUseCase {
  constructor() {
    super();
    this.rolRepository = new RolRepository();
  }

  async execute() {
    try {
      const roles = await this.rolRepository.findAll();
      return {
        success: true,
        data: roles,
        count: roles.length,
      };
    } catch (error) {
      throw new Error(`Error al obtener roles: ${error.message}`);
    }
  }
}

module.exports = GetRolesUseCase;
