const { Pool } = require('pg');
const IDatabaseConnection = require('./IDatabaseConnection');

class DatabaseConnection extends IDatabaseConnection {
  constructor() {
    super();
    this.pool = null;
  }

  async connect() {
    try {
      // Si hay una DATABASE_URL completa, usarla
      // Si no, construir desde variables individuales
      const connectionString = process.env.DATABASE_URL || this.buildConnectionString();

      this.pool = new Pool({
        connectionString,
        ssl: process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true' ? {
          rejectUnauthorized: false,
        } : false,
        max: parseInt(process.env.DB_POOL_MAX) || 20, // Máximo de conexiones en el pool
        idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT) || 30000,
        connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT) || 2000,
      });

      // Probar la conexión
      const client = await this.pool.connect();
      console.log('✅ Conectado a PostgreSQL (Neon)');
      
      // Ejecutar una query simple para verificar
      const result = await client.query('SELECT NOW()');
      console.log('📅 Hora del servidor:', result.rows[0].now);
      
      client.release();
    } catch (error) {
      console.error('❌ Error al conectar a la base de datos:', error.message);
      throw error;
    }
  }

  buildConnectionString() {
    const {
      DB_HOST,
      DB_PORT,
      DB_NAME,
      DB_USER,
      DB_PASSWORD,
    } = process.env;

    if (!DB_HOST || !DB_NAME || !DB_USER || !DB_PASSWORD) {
      throw new Error('Variables de base de datos no configuradas. Usa DATABASE_URL o configura DB_HOST, DB_NAME, DB_USER, DB_PASSWORD');
    }

    const port = DB_PORT || 5432;
    return `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${port}/${DB_NAME}?sslmode=require`;
  }

  async disconnect() {
    try {
      if (this.pool) {
        await this.pool.end();
        console.log('✅ Desconectado de PostgreSQL');
      }
    } catch (error) {
      console.error('❌ Error al desconectar de la base de datos:', error.message);
      throw error;
    }
  }

  getConnection() {
    return this.pool;
  }

  // Método helper para ejecutar queries
  async query(text, params) {
    if (!this.pool) {
      throw new Error('La base de datos no está conectada');
    }
    return this.pool.query(text, params);
  }
}

module.exports = DatabaseConnection;
