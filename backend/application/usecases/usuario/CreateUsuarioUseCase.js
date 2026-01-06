const IUseCase = require('../../../domain/usecases/IUseCase');
const UsuarioRepository = require('../../../infrastructure/repositories/UsuarioRepository');

class CreateUsuarioUseCase extends IUseCase {
  constructor() {
    super();
    this.usuarioRepository = new UsuarioRepository();
  }

  async execute(usuarioData) {
    try {
      this.validateUsuarioData(usuarioData);

      const usuarios = await this.usuarioRepository.findAll();
      const loginExists = usuarios.some(
        (usuario) => usuario.usuario_login &&
          usuario.usuario_login.toLowerCase() === usuarioData.usuario_login.toLowerCase()
      );

      if (loginExists) {
        throw new Error('Ya existe un usuario con ese login');
      }

      const emailExists = usuarios.some(
        (usuario) => usuario.email && usuario.email.toLowerCase() === usuarioData.email.toLowerCase()
      );

      if (emailExists) {
        throw new Error('Ya existe un usuario con ese email');
      }

      const nuevoUsuario = await this.usuarioRepository.create(usuarioData);

      return {
        data: nuevoUsuario,
        message: 'Usuario creado exitosamente',
      };
    } catch (error) {
      console.error('Error en CreateUsuarioUseCase:', error);
      throw error;
    }
  }

  validateUsuarioData(data) {
    const requiredFields = ['nombre', 'email', 'usuario_login', 'hash_password'];

    for (const field of requiredFields) {
      if (!data[field] || data[field].toString().trim() === '') {
        throw new Error(`El campo ${field} es requerido`);
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('El formato del email no es valido');
    }
  }
}

module.exports = CreateUsuarioUseCase;
