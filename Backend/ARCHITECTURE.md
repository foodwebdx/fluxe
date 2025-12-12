# Personal Blogging Platform API - Clean Architecture

## 🏗️ Architecture Overview

This project implements **Clean Architecture** principles with **Entity-Based Organization** and **Modular Dependency Injection** for a scalable and maintainable Personal Blogging Platform API.

### 📐 Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     🌐 External Layer                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              🔧 Infrastructure Layer               │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │            📱 Application Layer             │   │   │
│  │  │  ┌─────────────────────────────────────┐   │   │   │
│  │  │  │         💼 Domain Layer             │   │   │   │
│  │  │  │   ┌─────────────────────────────┐   │   │   │   │
│  │  │  │   │      🎯 Entities Core       │   │   │   │   │
│  │  │  │   └─────────────────────────────┘   │   │   │   │
│  │  │  └─────────────────────────────────────┘   │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
src/
├── 💼 domain/                       # Domain Layer - Business Logic Core
│   ├── entities/                   # Business entities with core logic
│   │   └── User.js                # ✅ User entity with validation rules
│   └── repositories/              # Repository contracts (interfaces)
│       └── IUserRepository.js     # ✅ User repository interface
│
├── 📱 application/                 # Application Layer - Use Cases
│   └── usecases/                  # Business use cases organized by entity
│       └── UserUseCases/          # ✅ All User-related business operations
│           ├── CreateUserUseCase.js         # Create new user
│           ├── UpdateUserProfileUseCase.js  # Update user profile
│           ├── ActivateUserUseCase.js       # Activate user account
│           ├── DeactivateUserUseCase.js     # Deactivate user account
│           └── GetUserPostsUseCase.js       # Get posts by user
│
└── 🔧 infrastructure/             # Infrastructure Layer - External Concerns
    ├── controllers/               # HTTP request handlers
    │   └── UserController.js     # ✅ User HTTP endpoint controller
    │
    ├── repositories/             # Repository implementations
    │   └── UserRepository.js     # ✅ MySQL implementation of IUserRepository
    │
    ├── database/                 # Database configuration
    │   └── DatabaseConnection.js # ✅ MySQL connection with pooling
    │
    ├── config/                   # Dependency injection configuration
    │   ├── DIContainer.js        # ✅ Main DI container
    │   └── modules/              # Entity-specific DI configurations
    │       └── UserDIConfig.js   # ✅ User dependencies configuration
    │
    ├── factories/                # Object creation factories
    │   └── ControllerFactory.js  # ✅ Controller creation with DI
    │
    ├── middleware/               # Express middleware
    │   ├── errorHandler.js       # Global error handling
    │   └── validation.js         # Request validation
    │
    └── routes/                   # HTTP routes organized by entity
        ├── index.js              # ✅ Main API router with documentation
        └── userRoutes.js         # ✅ User-specific routes
```

## 🎯 Key Design Patterns

### 🔄 Repository Pattern
- **Interface**: `IUserRepository` (Domain layer)
- **Implementation**: `UserRepository` (Infrastructure layer)
- **Benefits**: Easy to swap between MySQL, PostgreSQL, MongoDB, or mock implementations

### 💉 Dependency Injection
- **Container**: `DIContainer` manages all dependencies
- **Modular**: Entity-specific configurations (`UserDIConfig`)
- **Benefits**: Loose coupling, easy testing, maintainable code

### 🏭 Factory Pattern
- **ControllerFactory**: Creates controllers with injected dependencies
- **Benefits**: Centralized object creation, consistent dependency injection

### 📋 Use Case Pattern
- Each business operation is a separate class
- **Benefits**: Single responsibility, easy to test, clear business logic

## 🌐 API Endpoints

### 👤 User Management
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user profile
- `PATCH /api/users/:id/activate` - Activate user
- `PATCH /api/users/:id/deactivate` - Deactivate user
- `DELETE /api/users/:id` - Delete user

### 📄 Documentation
- `GET /api/` - API documentation and health check

## 🗄️ Database Integration

### MySQL Configuration
- **Connection Pooling**: Efficient database connections
- **Environment Variables**: Secure configuration via `.env`
- **Error Handling**: Graceful database error management

### Environment Setup
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=personal_blog
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation
```bash
npm install
```

### Database Setup
1. Create MySQL database
2. Configure `.env` file
3. Run SQL scripts in `database/` folder

### Run Application
```bash
npm start
```

## � Adding New Features

### Example: Adding Comment Entity

1. **Domain Layer**:
   ```javascript
   // src/domain/entities/Comment.js
   // src/domain/repositories/ICommentRepository.js
   ```

2. **Application Layer**:
   ```javascript
   // src/application/usecases/CommentUseCases/
   //   ├── CreateCommentUseCase.js
   //   ├── UpdateCommentUseCase.js
   //   └── DeleteCommentUseCase.js
   ```

3. **Infrastructure Layer**:
   ```javascript
   // src/infrastructure/repositories/CommentRepository.js
   // src/infrastructure/controllers/CommentController.js
   // src/infrastructure/routes/commentRoutes.js
   // src/infrastructure/config/modules/CommentDIConfig.js
   ```

4. **Register in DI Container**:
   ```javascript
   // Update src/infrastructure/config/DIContainer.js
   const CommentDIConfig = require('./modules/CommentDIConfig');
   CommentDIConfig.register(this);
   ```

## ✅ Benefits of This Architecture

### 🎯 **Maintainability**
- Clear separation of concerns
- Entity-based organization
- Consistent patterns throughout

### 🔄 **Testability**
- Dependency injection enables easy mocking
- Use cases can be tested in isolation
- Repository pattern allows database-independent tests

### 📈 **Scalability**
- Easy to add new entities
- Modular dependency injection
- Clean layer separation

### 🔧 **Flexibility**
- Swap database implementations easily
- Add new features without affecting existing code
- Environment-based configuration

### 🛡️ **Reliability**
- Comprehensive error handling
- Input validation
- Graceful degradation

This architecture ensures your Personal Blogging Platform API is robust, maintainable, and ready to scale! 🎉
