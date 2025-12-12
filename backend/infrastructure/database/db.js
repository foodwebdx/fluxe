const DatabaseConnection = require('./DatabaseConnection');

// Instancia singleton de la conexión
let dbInstance = null;

const getDatabase = () => {
  if (!dbInstance) {
    dbInstance = new DatabaseConnection();
  }
  return dbInstance;
};

// Función para obtener el pool directamente (para repositorios)
const getPool = () => {
  const db = getDatabase();
  const pool = db.getConnection();
  if (!pool) {
    throw new Error('La base de datos no está conectada. Asegúrate de que el servidor se haya iniciado correctamente.');
  }
  return pool;
};

module.exports = { getDatabase, getPool };

