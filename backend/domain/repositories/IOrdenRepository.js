const IBaseRepository = require('./IBaseRepository');

class IOrdenRepository extends IBaseRepository {
    async findByCliente(idCliente) {
        throw new Error('Método findByCliente() debe ser implementado');
    }

    async findByEstado(idEstado) {
        throw new Error('Método findByEstado() debe ser implementado');
    }

    async findByFlujo(idFlujo) {
        throw new Error('Método findByFlujo() debe ser implementado');
    }

    async cambiarEstado(idOrden, nuevoEstadoId, usuarioId) {
        throw new Error('Método cambiarEstado() debe ser implementado');
    }
}

module.exports = IOrdenRepository;
