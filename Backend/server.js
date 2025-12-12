const App = require('./src/app');
const dbConnection = require('./src/infrastructure/database/DatabaseConnection');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  try {
    console.log('🔗 Testing database connection...');
    const isConnected = await dbConnection.testConnection();
    
    if (!isConnected) {
      console.error('❌ Database connection failed. Check your .env configuration');
      process.exit(1);
    }
    
    console.log('🚀 Starting Express server...');
    const app = new App().getApp();
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${NODE_ENV}`);
      console.log(`🗄️  Database: ${process.env.DB_NAME} on ${process.env.DB_HOST}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API Base: http://localhost:${PORT}/api`);
    });

    setupGracefulShutdown(server);
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

function setupGracefulShutdown(server) {
  const gracefulShutdown = async (signal) => {
    console.log(`👋 ${signal} received, shutting down gracefully`);
    
    try {
      server.close(() => {
        console.log('✅ HTTP server closed');
      });
      
      await dbConnection.close();
      
      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

startServer();
