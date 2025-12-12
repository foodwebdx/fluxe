// Interface para casos de uso
// En JavaScript, las interfaces se representan como clases abstractas o documentación

class IUseCase {
  async execute(request) {
    throw new Error('execute method must be implemented');
  }
}

module.exports = IUseCase;

