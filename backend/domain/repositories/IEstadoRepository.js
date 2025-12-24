const IBaseRepository = require('./IBaseRepository');

class IEstadoRepository extends IBaseRepository {
    constructor() {
        super();
    }

    /**
     * Buscar estado por nombre
     * @param {string} nombreEstado - Nombre del estado
     * @returns {Promise<Estado|null>}
     */
    async findByNombre(nombreEstado) {
        throw new Error('Método findByNombre() debe ser implementado');
    }

    /**
     * Verificar si un estado está en uso en flujos activos
     * @param {number} idEstado - ID del estado
     * @returns {Promise<boolean>}
     */
    async isInUse(idEstado) {
        throw new Error('Método isInUse() debe ser implementado');
    }
}

module.exports = IEstadoRepository;
