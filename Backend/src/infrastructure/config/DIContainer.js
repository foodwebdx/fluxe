// Container SIMPLE y MODULAR para manejar todas las dependencias
class DIContainer {
  constructor() {
    this.dependencies = new Map();
    this.setupDependencies();
  }

  setupDependencies() {
    const UserDIConfig = require('./modules/UserDIConfig');
    UserDIConfig.register(this);

  }

  register(name, dependency) {
    this.dependencies.set(name, dependency);
  }

  get(name) {
    const dependency = this.dependencies.get(name);
    if (!dependency) {
      throw new Error(`Dependency '${name}' not found`);
    }
    return dependency;
  }
}

module.exports = DIContainer;
