const IBaseRepository = require('./IBaseRepository');

class IComentarioEstadoRepository extends IBaseRepository {
    constructor() {
        super();
    }

    /**
     * Buscar comentarios por historial
     * @param {number} idHistorial - ID del historial de estado
     * @returns {Promise<Array>}
     */
    async findByHistorial(idHistorial) {
        throw new Error('Método findByHistorial() debe ser implementado');
    }

    /**
     * Buscar comentarios por orden (a través del historial)
     * @param {number} idOrden - ID de la orden
     * @returns {Promise<Array>}
     */
    async findByOrden(idOrden) {
        throw new Error('Método findByOrden() debe ser implementado');
    }
}

module.exports = IComentarioEstadoRepository;
