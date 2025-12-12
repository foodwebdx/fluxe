class UpdateUserProfileUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId, profileData) {
    const existingUserData = await this.userRepository.findById(userId);
    if (!existingUserData) {
      throw new Error('User not found');
    }

    const User = require('../../domain/entities/User');
    const user = new User(existingUserData);

    user.updateProfile(profileData);

    console.log(`Profile updated for: ${user.getFullName()}`);

    return await this.userRepository.update(userId, user);
  }
}

module.exports = UpdateUserProfileUseCase;
