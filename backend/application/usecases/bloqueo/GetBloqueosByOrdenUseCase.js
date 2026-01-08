const IUseCase = require('../../../domain/usecases/IUseCase');
const BloqueoEstadoRepository = require('../../../infrastructure/repositories/BloqueoEstadoRepository');

class GetBloqueosByOrdenUseCase extends IUseCase {
    constructor() {
        super();
        this.bloqueoRepository = new BloqueoEstadoRepository();
    }

    async execute(idOrden) {
        try {
            if (!idOrden) {
                throw new Error('El ID de la orden es requerido');
            }

            const bloqueos = await this.bloqueoRepository.findByOrden(idOrden);

            return {
                data: bloqueos,
                total: bloqueos.length
            };
        } catch (error) {
            console.error('Error en GetBloqueosByOrdenUseCase:', error);
            throw new Error('Error al obtener los bloqueos de la orden: ' + error.message);
        }
    }
}

module.exports = GetBloqueosByOrdenUseCase;
