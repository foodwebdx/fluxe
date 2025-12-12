const IUseCase = require('../../../domain/usecases/IUseCase');

class ExampleUseCase extends IUseCase {
  async execute(request) {
    // Lógica de negocio aquí
    return {
      result: `Procesado: ${request.message}`,
    };
  }
}

module.exports = ExampleUseCase;

