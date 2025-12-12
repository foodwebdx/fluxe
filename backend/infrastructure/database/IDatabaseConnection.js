// Interface para conexión a base de datos
// En JavaScript, las interfaces se representan como clases abstractas o documentación

class IDatabaseConnection {
  async connect() {
    throw new Error('connect method must be implemented');
  }

  async disconnect() {
    throw new Error('disconnect method must be implemented');
  }

  getConnection() {
    throw new Error('getConnection method must be implemented');
  }
}

module.exports = IDatabaseConnection;

