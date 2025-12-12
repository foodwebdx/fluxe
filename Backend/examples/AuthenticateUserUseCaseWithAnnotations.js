/**
 * Use Case para autenticar usuarios
 * @dependencies userRepository, emailService, hashService
 */
class AuthenticateUserUseCase {
  static getDependencies() {
    // 🎯 MÉTODO ESTÁTICO que declara dependencias explícitamente
    return ['userRepository', 'emailService', 'hashService'];
  }

  constructor(userRepository, emailService, hashService) {
    this.userRepository = userRepository;
    this.emailService = emailService;
    this.hashService = hashService;
  }

  async execute(email, password) {
    // Buscar usuario
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Validar password
    const isValid = await this.hashService.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Enviar notificación de login
    await this.emailService.sendLoginNotification(user.email);

    return user;
  }
}

module.exports = AuthenticateUserUseCase;
