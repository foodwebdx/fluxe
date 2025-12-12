const ExampleUseCase = require('../../application/usecases/example/ExampleUseCase');

class ExampleController {
  constructor() {
    this.exampleUseCase = new ExampleUseCase();
  }

  async handle(req, res) {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'El campo message es requerido',
        });
      }

      const result = await this.exampleUseCase.execute({ message });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }
}

module.exports = ExampleController;

