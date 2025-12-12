const express = require('express');
const ControllerFactory = require('../factories/ControllerFactory');
const { validateUserData } = require('../middleware/validation');

function createUserRoutes() {
  const router = express.Router();
  const factory = new ControllerFactory();
  
  const userController = factory.createUserController();

  router.get('/', userController.getUsers.bind(userController));
  router.get('/:id', userController.getUserById.bind(userController));
  router.post('/', validateUserData, userController.createUser.bind(userController));
  router.put('/:id', userController.updateUser.bind(userController));
  router.delete('/:id', userController.deleteUser.bind(userController));

  return router;
}

module.exports = createUserRoutes;
