const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./infrastructure/routes');
const errorHandler = require('./infrastructure/middleware/errorHandler');

class App {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    this.app.use(helmet());
    
    this.app.use(cors());
  
    this.app.use(morgan('combined'));
    
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Personal Blogging Platform API'
      });
    });

    this.app.use('/api', routes);
  }

  setupErrorHandling() {
    this.app.use((req, res, next) => {
      res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
      });
    });

    this.app.use(errorHandler);
  }

  getApp() {
    return this.app;
  }
}

module.exports = App;
