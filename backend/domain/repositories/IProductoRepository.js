const IBaseRepository = require('./IBaseRepository');

class IProductoRepository extends IBaseRepository {
    async findByCliente(idCliente) {
        throw new Error('Método findByCliente() debe ser implementado');
    }
}

module.exports = IProductoRepository;
