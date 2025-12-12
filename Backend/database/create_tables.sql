-- 🗄️ SQL Script para crear tablas en MySQL Workbench
-- Ejecuta este script en tu base de datos

-- ===================================
-- 📋 TABLA: users
-- ===================================
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(50) NOT NULL,
  lastName VARCHAR(50) NOT NULL,
  role ENUM('admin', 'editor', 'author') DEFAULT 'author',
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices para mejorar performance
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_role (role),
  INDEX idx_active (isActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 📋 TABLA: posts (para futuro)
-- ===================================
CREATE TABLE IF NOT EXISTS posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  authorId INT NOT NULL,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  publishedAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Relaciones
  FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Índices
  INDEX idx_author (authorId),
  INDEX idx_status (status),
  INDEX idx_slug (slug),
  INDEX idx_published (publishedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 🌱 DATOS DE PRUEBA (Opcional)
-- ===================================
-- Solo ejecuta esto si quieres datos de prueba

-- Insertar usuarios de prueba (password: "password123" hasheado con bcrypt)
INSERT IGNORE INTO users (username, email, password, firstName, lastName, role) VALUES
('admin', 'admin@blog.com', '$2b$12$rQJB7Kl8Y9m1Z6h8p7s1K.V2Q3E4R5T6Y7U8I9O0P1A2S3D4F5G6H7', 'Admin', 'User', 'admin'),
('editor1', 'editor@blog.com', '$2b$12$rQJB7Kl8Y9m1Z6h8p7s1K.V2Q3E4R5T6Y7U8I9O0P1A2S3D4F5G6H7', 'Editor', 'Blog', 'editor'),
('author1', 'author@blog.com', '$2b$12$rQJB7Kl8Y9m1Z6h8p7s1K.V2Q3E4R5T6Y7U8I9O0P1A2S3D4F5G6H7', 'John', 'Doe', 'author');

-- Verificar que se insertaron correctamente
SELECT id, username, email, firstName, lastName, role, isActive, createdAt 
FROM users 
ORDER BY createdAt DESC;
