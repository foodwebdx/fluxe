const IUseCase = require('../../../domain/usecases/IUseCase');
const RolRepository = require('../../../infrastructure/repositories/RolRepository');

class UpdateRolUseCase extends IUseCase {
  constructor() {
    super();
    this.rolRepository = new RolRepository();
  }

  async execute(id, rolData) {
    try {
      const rolExistente = await this.rolRepository.findById(id);

      if (!rolExistente) {
        throw new Error('Rol no encontrado');
      }

      if (rolData.nombre_rol) {
        if (rolData.nombre_rol.length > 100) {
          throw new Error('El nombre del rol no puede exceder 100 caracteres');
        }

        const roles = await this.rolRepository.findAll();
        const nombreExiste = roles.some(
          (rol) =>
            rol.nombre_rol &&
            rol.nombre_rol.toLowerCase() === rolData.nombre_rol.toLowerCase() &&
            rol.id_rol !== parseInt(id)
        );

        if (nombreExiste) {
          throw new Error('Ya existe un rol con ese nombre');
        }
      }

      const rolActualizado = await this.rolRepository.update(id, rolData);

      if (!rolActualizado) {
        throw new Error('Rol no encontrado');
      }

      return {
        data: rolActualizado,
        message: 'Rol actualizado exitosamente',
      };
    } catch (error) {
      console.error('Error en UpdateRolUseCase:', error);
      throw error;
    }
  }
}

module.exports = UpdateRolUseCase;
