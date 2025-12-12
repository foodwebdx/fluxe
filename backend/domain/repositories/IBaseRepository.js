// Interface para repositorios base
// En JavaScript, las interfaces se representan como clases abstractas o documentación

class IBaseRepository {
  async findById(id) {
    throw new Error('findById method must be implemented');
  }

  async findAll() {
    throw new Error('findAll method must be implemented');
  }

  async create(entity) {
    throw new Error('create method must be implemented');
  }

  async update(id, entity) {
    throw new Error('update method must be implemented');
  }

  async delete(id) {
    throw new Error('delete method must be implemented');
  }
}

module.exports = IBaseRepository;

