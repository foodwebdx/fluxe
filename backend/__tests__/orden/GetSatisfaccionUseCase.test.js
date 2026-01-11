const GetSatisfaccionUseCase = require('../../application/usecases/orden/GetSatisfaccionUseCase');

describe('GetSatisfaccionUseCase', () => {
  it('computes distribution counts for a rating field', () => {
    const useCase = new GetSatisfaccionUseCase();
    const encuestas = [
      { satisfaccion_general: 5 },
      { satisfaccion_general: 4 },
      { satisfaccion_general: 5 },
      { satisfaccion_general: 2 },
      { satisfaccion_general: 8 },
    ];

    const result = useCase.calcularDistribucion(encuestas, 'satisfaccion_general');

    expect(result).toEqual([
      { calificacion: 1, cantidad: 0 },
      { calificacion: 2, cantidad: 1 },
      { calificacion: 3, cantidad: 0 },
      { calificacion: 4, cantidad: 1 },
      { calificacion: 5, cantidad: 2 },
    ]);
  });
});
