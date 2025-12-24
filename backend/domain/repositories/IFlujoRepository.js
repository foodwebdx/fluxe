const IBaseRepository = require('./IBaseRepository');

class IFlujoRepository extends IBaseRepository {
    constructor() {
        super();
    }

    /**
     * Buscar flujo por nombre
     * @param {string} nombreFlujo - Nombre del flujo
     * @returns {Promise<Flujo|null>}
     */
    async findByNombre(nombreFlujo) {
        throw new Error('Método findByNombre() debe ser implementado');
    }

    /**
     * Obtener flujos activos
     * @returns {Promise<Flujo[]>}
     */
    async findActivos() {
        throw new Error('Método findActivos() debe ser implementado');
    }

    /**
     * Obtener estados de un flujo
     * @param {number} idFlujo - ID del flujo
     * @returns {Promise<FlujoEstado[]>}
     */
    async getEstadosFlujo(idFlujo) {
        throw new Error('Método getEstadosFlujo() debe ser implementado');
    }

    /**
     * Configurar estados de un flujo
     * @param {number} idFlujo - ID del flujo
     * @param {Array} estados - Array de {id_estado, posicion, obligatorio}
     * @returns {Promise<boolean>}
     */
    async configurarEstados(idFlujo, estados) {
        throw new Error('Método configurarEstados() debe ser implementado');
    }

    /**
     * Obtener el primer estado de un flujo
     * @param {number} idFlujo - ID del flujo
     * @returns {Promise<number|null>} - ID del primer estado
     */
    async getPrimerEstado(idFlujo) {
        throw new Error('Método getPrimerEstado() debe ser implementado');
    }
}

module.exports = IFlujoRepository;
