const PrismaService = require('./PrismaService');

// Instancia singleton de Prisma
let prismaInstance = null;

const getDatabase = () => {
  if (!prismaInstance) {
    prismaInstance = new PrismaService();
  }
  return prismaInstance;
};

// Función para obtener el cliente Prisma directamente (para repositorios)
const getPrisma = () => {
  const db = getDatabase();
  const prisma = db.getClient();
  if (!prisma) {
    throw new Error('Prisma no está conectado. Asegúrate de que el servidor se haya iniciado correctamente.');
  }
  return prisma;
};

// Mantener getPool para compatibilidad con código antiguo (deprecated)
const getPool = () => {
  console.warn('⚠️  getPool() está deprecated. Usa getPrisma() para acceder al cliente Prisma.');
  return getPrisma();
};

module.exports = { getDatabase, getPrisma, getPool };

