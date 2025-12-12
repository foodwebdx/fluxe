# Express.js Clean Architecture Template

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-blue.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-ready **Express.js template** implementing **Clean Architecture** principles with **MySQL integration**, designed for scalable and maintainable backend applications.

## 🎯 Why This Template?

The creation of this Express.js template arose from the need to have a **full well-designed backend** that can be used **immediately** for production projects, without spending time on architectural decisions and boilerplate setup.

### ✨ Key Features

- 🏗️ **Clean Architecture** - Separation of concerns with clear layer boundaries
- 💉 **Dependency Injection** - Modular and testable code structure
- 🗄️ **MySQL Integration** - Production-ready database with connection pooling
- 🔒 **Environment Security** - Secure configuration management
- 📋 **Use Case Pattern** - Clear business logic organization
- 🏭 **Factory Pattern** - Consistent object creation
- 🔄 **Repository Pattern** - Database abstraction layer
- 📁 **Entity-Based Organization** - Scalable folder structure
- ⚡ **Performance Optimized** - Efficient database connections and error handling

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **MySQL** 8.0+
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Milan08S/ExpressJs-CleanArchitecture.git
   cd ExpressJs-CleanArchitecture
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your MySQL credentials
   ```

4. **Setup database**
   - Create MySQL database
   - Run SQL scripts from `database/create_tables.sql`

5. **Start the server**
   ```bash
   npm start
   ```

🎉 **Server running at** `http://localhost:3000`

## 📁 Project Structure

```
src/
├── 💼 domain/                       # Business Logic Core
│   ├── entities/                   # Business entities
│   │   └── User.js                # User entity with validation
│   └── repositories/              # Repository contracts
│       └── IUserRepository.js     # User repository interface
│
├── 📱 application/                 # Use Cases Layer
│   └── usecases/                  # Business operations
│       └── UserUseCases/          # User-related operations
│           ├── CreateUserUseCase.js
│           ├── UpdateUserProfileUseCase.js
│           ├── ActivateUserUseCase.js
│           └── DeactivateUserUseCase.js
│
└── 🔧 infrastructure/             # External Concerns
    ├── controllers/               # HTTP handlers
    ├── repositories/             # Database implementations
    ├── database/                 # Database configuration
    ├── config/                   # Dependency injection
    ├── middleware/               # Express middleware
    └── routes/                   # API routes
```

## 🌐 API Endpoints

### 👤 User Management
```
GET    /api/users              # Get all users
GET    /api/users/:id          # Get user by ID
POST   /api/users              # Create new user
PUT    /api/users/:id          # Update user profile
PATCH  /api/users/:id/activate # Activate user
PATCH  /api/users/:id/deactivate # Deactivate user
DELETE /api/users/:id          # Delete user
```

### 📄 Documentation
```
GET    /api/                   # API documentation
```

## 🗄️ Database Configuration

### Environment Variables
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
DB_PORT=3306
```

### Features
- **Connection Pooling** - Efficient resource management
- **Error Handling** - Graceful database error management
- **SQL Injection Protection** - Prepared statements
- **Transaction Support** - Data consistency

## 🏗️ Architecture Patterns

### 🔄 Repository Pattern
```javascript
// Interface (Domain)
class IUserRepository {
  async findAll() { throw new Error('Not implemented'); }
}

// Implementation (Infrastructure)
class UserRepository extends IUserRepository {
  async findAll() {
    // MySQL implementation
  }
}
```

### 💉 Dependency Injection
```javascript
// Modular DI Configuration
class UserDIConfig {
  static register(container) {
    container.register('userRepository', new UserRepository());
    container.register('createUserUseCase', new CreateUserUseCase(
      container.get('userRepository')
    ));
  }
}
```

### 📋 Use Case Pattern
```javascript
class CreateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userData) {
    // Business logic here
    return await this.userRepository.create(userData);
  }
}
```

## 🔧 Adding New Features

### Example: Adding Comments Entity

1. **Domain Layer**
   ```javascript
   // src/domain/entities/Comment.js
   // src/domain/repositories/ICommentRepository.js
   ```

2. **Application Layer**
   ```javascript
   // src/application/usecases/CommentUseCases/
   //   ├── CreateCommentUseCase.js
   //   ├── UpdateCommentUseCase.js
   //   └── DeleteCommentUseCase.js
   ```

3. **Infrastructure Layer**
   ```javascript
   // src/infrastructure/repositories/CommentRepository.js
   // src/infrastructure/controllers/CommentController.js
   // src/infrastructure/routes/commentRoutes.js
   // src/infrastructure/config/modules/CommentDIConfig.js
   ```

4. **Register Dependencies**
   ```javascript
   // src/infrastructure/config/DIContainer.js
   const CommentDIConfig = require('./modules/CommentDIConfig');
   CommentDIConfig.register(this);
   ```

## 📚 Documentation

- **[Architecture Guide](ARCHITECTURE.md)** - Detailed architecture explanation
- **[API Examples](examples/)** - Usage examples

## ✅ Benefits

### 🎯 **For Developers**
- **Faster Development** - Skip architectural setup
- **Best Practices** - Industry-standard patterns
- **Scalable Structure** - Easy to extend and maintain
- **Learning Resource** - Clean Architecture implementation

### 🚀 **For Projects**
- **Production Ready** - Tested and optimized
- **Secure** - Environment-based configuration
- **Maintainable** - Clear separation of concerns
- **Testable** - Dependency injection enables easy testing

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have any questions or need help, please:

- 📧 Open an issue on GitHub
- 💬 Start a discussion
- ⭐ Star the repository if you find it helpful

---

**Ready to build something amazing?** 🚀

Start your next project with this template and focus on what matters - your business logic!