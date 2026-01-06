const LoginUseCase = require('../../application/usecases/auth/LoginUseCase');

class AuthController {
  constructor() {
    this.loginUseCase = new LoginUseCase();
  }

  async login(req, res) {
    try {
      const result = await this.loginUseCase.execute(req.body);

      return res.status(200).json({
        success: true,
        message: 'Login exitoso',
        ...result,
      });
    } catch (error) {
      const statusCode = error.message.includes('Credenciales') ? 401 : 400;
      return res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al iniciar sesion',
      });
    }
  }
}

module.exports = AuthController;
