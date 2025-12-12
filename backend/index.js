require('dotenv').config();
const express = require('express');
const routes = require('./presentation/routes');
const errorHandler = require('./presentation/middlewares/errorHandler');
const notFound = require('./presentation/middlewares/notFound');
const requestLogger = require('./presentation/middlewares/requestLogger');
const { getDatabase } = require('./infrastructure/database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenido a Fluxe API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      example: '/api/example',
    },
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    const db = dbConnection.getConnection();
    let dbStatus = 'disconnected';
    
    if (db) {
      try {
        await db.query('SELECT 1');
        dbStatus = 'connected';
      } catch (error) {
        dbStatus = 'error';
      }
    }

    res.json({
      success: true,
      message: 'Server is running',
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message,
    });
  }
});

app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Database connection (singleton)
const dbConnection = getDatabase();

// Start server
const startServer = async () => {
  try {
    await dbConnection.connect();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📝 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API base: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  await dbConnection.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT recibido, cerrando servidor...');
  await dbConnection.disconnect();
  process.exit(0);
});

startServer();

module.exports = app;

