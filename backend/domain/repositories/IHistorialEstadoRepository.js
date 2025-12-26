const IBaseRepository = require('./IBaseRepository');

class IHistorialEstadoRepository extends IBaseRepository {
    constructor() {
        super();
    }

    /**
     * Buscar historial por orden
     * @param {number} idOrden - ID de la orden
     * @returns {Promise<Array>}
     */
    async findByOrden(idOrden) {
        throw new Error('Método findByOrden() debe ser implementado');
    }

    /**
     * Obtener el último cambio de estado de una orden
     * @param {number} idOrden - ID de la orden
     * @returns {Promise<Object|null>}
     */
    async findLastByOrden(idOrden) {
        throw new Error('Método findLastByOrden() debe ser implementado');
    }
}

module.exports = IHistorialEstadoRepository;
