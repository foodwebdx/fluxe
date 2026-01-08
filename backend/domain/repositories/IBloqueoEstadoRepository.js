const IBaseRepository = require('./IBaseRepository');

class IBloqueoEstadoRepository extends IBaseRepository {
    constructor() {
        super();
    }

    /**
     * Buscar bloqueos por historial
     * @param {number} idHistorial - ID del historial de estado
     * @returns {Promise<Array>}
     */
    async findByHistorial(idHistorial) {
        throw new Error('Metodo findByHistorial() debe ser implementado');
    }

    /**
     * Buscar bloqueos por orden (a traves del historial)
     * @param {number} idOrden - ID de la orden
     * @returns {Promise<Array>}
     */
    async findByOrden(idOrden) {
        throw new Error('Metodo findByOrden() debe ser implementado');
    }
}

module.exports = IBloqueoEstadoRepository;
