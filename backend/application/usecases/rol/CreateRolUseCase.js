const IUseCase = require('../../../domain/usecases/IUseCase');
const RolRepository = require('../../../infrastructure/repositories/RolRepository');

class CreateRolUseCase extends IUseCase {
  constructor() {
    super();
    this.rolRepository = new RolRepository();
  }

  async execute(rolData) {
    try {
      this.validateRolData(rolData);

      const roles = await this.rolRepository.findAll();
      const nombreExiste = roles.some(
        (rol) => rol.nombre_rol && rol.nombre_rol.toLowerCase() === rolData.nombre_rol.toLowerCase()
      );

      if (nombreExiste) {
        throw new Error('Ya existe un rol con ese nombre');
      }

      const nuevoRol = await this.rolRepository.create(rolData);

      return {
        data: nuevoRol,
        message: 'Rol creado exitosamente',
      };
    } catch (error) {
      console.error('Error en CreateRolUseCase:', error);
      throw error;
    }
  }

  validateRolData(data) {
    if (!data.nombre_rol || data.nombre_rol.toString().trim() === '') {
      throw new Error('El nombre del rol es requerido');
    }

    if (data.nombre_rol && data.nombre_rol.length > 100) {
      throw new Error('El nombre del rol no puede exceder 100 caracteres');
    }
  }
}

module.exports = CreateRolUseCase;
