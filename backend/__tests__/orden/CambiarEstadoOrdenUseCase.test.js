jest.mock('../../infrastructure/repositories/OrdenRepository', () => {
  return jest.fn().mockImplementation(() => ({
    findById: jest.fn(),
  }));
});

jest.mock('../../infrastructure/repositories/FlujoRepository', () => {
  return jest.fn().mockImplementation(() => ({
    getEstadosFlujo: jest.fn(),
  }));
});

jest.mock('../../infrastructure/repositories/HistorialEstadoRepository', () => {
  return jest.fn().mockImplementation(() => ({
    create: jest.fn(),
  }));
});

jest.mock('../../infrastructure/repositories/ClienteRepository', () => {
  return jest.fn().mockImplementation(() => ({
    findById: jest.fn(),
  }));
});

jest.mock('../../infrastructure/repositories/BloqueoEstadoRepository', () => {
  return jest.fn().mockImplementation(() => ({
    findActiveByOrdenAndEstado: jest.fn(),
  }));
});

jest.mock('../../infrastructure/repositories/WhatsAppMensajeRepository', () => {
  return jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    deleteByOrden: jest.fn(),
    updateMessageId: jest.fn(),
  }));
});

jest.mock('../../infrastructure/services/WhatsAppService', () => ({
  default: {
    notifyOrderCompleted: jest.fn(),
    notifyStatusChange: jest.fn(),
    formatPhoneNumber: jest.fn(),
  },
}));

jest.mock('../../infrastructure/services/EmailService', () => ({
  sendEmail: jest.fn(),
}));

const CambiarEstadoOrdenUseCase = require('../../application/usecases/orden/CambiarEstadoOrdenUseCase');

describe('CambiarEstadoOrdenUseCase', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('rejects when the new state equals the current state', async () => {
    const useCase = new CambiarEstadoOrdenUseCase();
    const ordenRepo = useCase.ordenRepository;

    ordenRepo.findById = jest.fn().mockResolvedValue({
      id_orden: 10,
      id_flujo: 1,
      id_estado_actual: 2,
    });

    await expect(useCase.execute(10, 2)).rejects.toThrow(
      'La orden ya se encuentra en ese estado'
    );
  });
});
