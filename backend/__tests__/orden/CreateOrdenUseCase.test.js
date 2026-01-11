jest.mock('../../infrastructure/services/WhatsAppService', () => ({
  default: {
    notifyOrderCreated: jest.fn(),
  },
}));

jest.mock('../../infrastructure/services/EmailService', () => ({
  sendEmail: jest.fn(),
}));

const CreateOrdenUseCase = require('../../application/usecases/orden/CreateOrdenUseCase');

describe('CreateOrdenUseCase', () => {
  it('requires id_cliente in the order data', () => {
    const useCase = new CreateOrdenUseCase();

    expect(() => {
      useCase.validateOrdenData({
        descripcion_servicio: 'Reparacion basica',
        id_producto: 2,
        id_flujo: 1,
      });
    }).toThrow('Debe proporcionar id_cliente o datos del cliente');
  });
});
