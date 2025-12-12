class UpdateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId, updateData) {

    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const User = require('../../domain/entities/User');
    const user = new User(existingUser);

    user.updateProfile(updateData);

    return await this.userRepository.update(userId, user);
  }
}

module.exports = UpdateUserUseCase;
