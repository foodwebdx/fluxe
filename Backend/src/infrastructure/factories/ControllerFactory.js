const DIContainer = require('../config/DIContainer');

class ControllerFactory {
  constructor() {
    this.container = new DIContainer();
  }

  createUserController() {
    return this.container.get('userController');
  }

}

module.exports = ControllerFactory;
