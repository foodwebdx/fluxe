const IBaseRepository = require('./IBaseRepository');

class IEncuestaRepository extends IBaseRepository {
    constructor() {
        super();
    }

    /**
     * Buscar encuesta por orden
     * @param {number} idOrden - ID de la orden
     * @returns {Promise<Object|null>}
     */
    async findByOrden(idOrden) {
        throw new Error('Método findByOrden() debe ser implementado');
    }
}

module.exports = IEncuestaRepository;
