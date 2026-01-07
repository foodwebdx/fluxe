require('dotenv').config();
const express = require('express');
const routes = require('./presentation/routes');
const errorHandler = require('./presentation/middlewares/errorHandler');
const notFound = require('./presentation/middlewares/notFound');
const requestLogger = require('./presentation/middlewares/requestLogger');
const { getDatabase } = require('./infrastructure/database/db');

const app = express();

// CORS middleware - ACTUALIZADO para producción
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://fluxe.vercel.app',
  process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : null,
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Database connection (singleton) - Initialize before routes
const dbConnection = getDatabase();

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenido a Fluxe API',
    version: '1.0.0',
    orm: 'Prisma ORM',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/health',
      api: '/api',
    },
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', async (req, res) => {
  try {
    // Verificar conexión a la base de datos con Prisma
    const isConnected = await dbConnection.healthCheck();
    const dbStatus = isConnected ? 'connected' : 'disconnected';

    res.json({
      success: true,
      message: 'Server is running',
      database: dbStatus,
      orm: 'Prisma',
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

// IMPORTANTE: Solo iniciar servidor en desarrollo
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;

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
}

// Exportar app para Vercel
module.exports = app;

