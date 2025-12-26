const IBaseRepository = require('./IBaseRepository');

class IEvidenciaRepository extends IBaseRepository {
    constructor() {
        super();
    }

    /**
     * Buscar evidencias por orden
     * @param {number} idOrden - ID de la orden
     * @returns {Promise<Array>}
     */
    async findByOrden(idOrden) {
        throw new Error('Método findByOrden() debe ser implementado');
    }

    /**
     * Buscar evidencias por estado
     * @param {number} idEstado - ID del estado
     * @returns {Promise<Array>}
     */
    async findByEstado(idEstado) {
        throw new Error('Método findByEstado() debe ser implementado');
    }

    /**
     * Buscar evidencias por tipo
     * @param {string} tipoEvidencia - Tipo de evidencia
     * @returns {Promise<Array>}
     */
    async findByTipo(tipoEvidencia) {
        throw new Error('Método findByTipo() debe ser implementado');
    }
}

module.exports = IEvidenciaRepository;
