class DeactivateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId, requestingUserId) {
    const requestingUserData = await this.userRepository.findById(requestingUserId);
    if (!requestingUserData) {
      throw new Error('Requesting user not found');
    }

    const User = require('../../domain/entities/User');
    const requestingUser = new User(requestingUserData);

    if (!requestingUser.hasPermission('manage_users')) {
      throw new Error('Insufficient permissions to deactivate users');
    }

    const targetUserData = await this.userRepository.findById(userId);
    if (!targetUserData) {
      throw new Error('Target user not found');
    }

    const targetUser = new User(targetUserData);

    targetUser.deactivate();

    console.log(`User deactivated: ${targetUser.getFullName()}`);

    return await this.userRepository.update(userId, targetUser);
  }
}

module.exports = DeactivateUserUseCase;
