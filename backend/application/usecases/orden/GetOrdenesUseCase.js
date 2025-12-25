const IUseCase = require('../../domain/usecases/IUseCase');
const OrdenRepository = require('../../../infrastructure/repositories/OrdenRepository');

class GetOrdenesUseCase extends IUseCase {
    constructor() {
        super();
        this.ordenRepository = new OrdenRepository();
    }

    async execute(filtros = {}) {
        try {
            let ordenes;

            // Aplicar filtros si existen
            if (filtros.id_cliente) {
                ordenes = await this.ordenRepository.findByCliente(filtros.id_cliente);
            } else if (filtros.id_estado) {
                ordenes = await this.ordenRepository.findByEstado(filtros.id_estado);
            } else if (filtros.id_flujo) {
                ordenes = await this.ordenRepository.findByFlujo(filtros.id_flujo);
            } else {
                ordenes = await this.ordenRepository.findAll();
            }

            return {
                data: ordenes,
                count: ordenes.length,
                filtros: filtros
            };
        } catch (error) {
            console.error('Error en GetOrdenesUseCase:', error);
            throw error;
        }
    }
}

module.exports = GetOrdenesUseCase;
