class BaseEntity {
  constructor(id) {
    this.id = id || this.generateId();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  updateTimestamp() {
    this.updatedAt = new Date();
  }
}

module.exports = BaseEntity;

