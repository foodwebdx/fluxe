const mysql = require('mysql2/promise');
require('dotenv').config();

class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.pool = null;
  }

  async createPool() {
    if (this.pool) {
      return this.pool;
    }

    try {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        acquireTimeout: 60000,
        timeout: 60000
      });

      console.log('✅ MySQL Pool created successfully');
      return this.pool;
    } catch (error) {
      console.error('❌ Error creating MySQL pool:', error);
      throw error;
    }
  }

  async connect() {
    if (this.connection) {
      return this.connection;
    }

    try {
      this.connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      console.log('✅ Connected to MySQL database');
      return this.connection;
    } catch (error) {
      console.error('❌ Error connecting to MySQL:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      const connection = await this.connect();
      const [rows] = await connection.execute('SELECT 1 as test');
      console.log('✅ Database connection test successful:', rows[0]);
      return true;
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      return false;
    }
  }

  async getPool() {
    if (!this.pool) {
      await this.createPool();
    }
    return this.pool;
  }

  async close() {
    try {
      if (this.connection) {
        await this.connection.end();
        this.connection = null;
        console.log('✅ MySQL connection closed');
      }
      
      if (this.pool) {
        await this.pool.end();
        this.pool = null;
        console.log('✅ MySQL pool closed');
      }
    } catch (error) {
      console.error('❌ Error closing MySQL connections:', error);
    }
  }
}

const dbConnection = new DatabaseConnection();

module.exports = dbConnection;
