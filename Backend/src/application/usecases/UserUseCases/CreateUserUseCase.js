class CreateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userData) {
    const { username, email, password, firstName, lastName, role = 'author' } = userData;

    if (!username || !email || !password || !firstName || !lastName) {
      throw new Error('Username, email, password, first name, and last name are required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    const existingUser = await this.userRepository.exists(email, username);
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 12);

    const User = require('../../domain/entities/User');
    const user = new User({
      ...userData,
      password: hashedPassword
    });

    return await this.userRepository.create(user);
  }
}

module.exports = CreateUserUseCase;
