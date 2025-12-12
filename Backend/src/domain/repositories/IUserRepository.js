class IUserRepository {
  async findAll() {
    throw new Error('Method findAll must be implemented');
  }

  async findById(id) {
    throw new Error('Method findById must be implemented');
  }

  async findByEmail(email) {
    throw new Error('Method findByEmail must be implemented');
  }

  async findByUsername(username) {
    throw new Error('Method findByUsername must be implemented');
  }

  async create(user) {
    throw new Error('Method create must be implemented');
  }

  async update(id, userData) {
    throw new Error('Method update must be implemented');
  }

  async delete(id) {
    throw new Error('Method delete must be implemented');
  }

  async exists(email, username) {
    throw new Error('Method exists must be implemented');
  }
}

module.exports = IUserRepository;
