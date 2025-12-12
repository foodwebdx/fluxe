class UserController {
  constructor(createUserUseCase, updateUserProfileUseCase, deactivateUserUseCase, activateUserUseCase, userRepository) {
    this.createUserUseCase = createUserUseCase;
    this.updateUserProfileUseCase = updateUserProfileUseCase;
    this.deactivateUserUseCase = deactivateUserUseCase;
    this.activateUserUseCase = activateUserUseCase;
    this.userRepository = userRepository;
  }

  async createUser(req, res, next) {
    try {
      const userData = req.body;
      const user = await this.createUserUseCase.execute(userData);
      
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      const usersData = await this.userRepository.findAll();
      
      const User = require('../../domain/entities/User');
      const enrichedUsers = usersData.map(userData => {
        const user = new User(userData);
        return {
          ...userData,
          fullName: user.getFullName(), 
          password: undefined
        };
      });
      
      res.status(200).json({
        success: true,
        data: enrichedUsers
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await this.userRepository.findById(parseInt(id));
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const user = await this.userRepository.update(parseInt(id), updateData);
      
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      await this.userRepository.delete(parseInt(id));
      
      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
