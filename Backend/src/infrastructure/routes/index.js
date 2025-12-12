const express = require('express');
const router = express.Router();

const createUserRoutes = require('./userRoutes');

router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the User Management API',
    version: '1.0.0',
    documentation: {
      users: {
        baseUrl: '/api/users',
        endpoints: {
          'GET /': 'Get all users',
          'GET /:id': 'Get user by ID',
          'POST /': 'Create new user',
          'PUT /:id': 'Update user',
          'DELETE /:id': 'Delete user'
        }
      }
    }
  });
});

// Mount entity routes
router.use('/users', createUserRoutes());

module.exports = router;
