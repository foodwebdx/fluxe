# Configuración de Base de Datos

Este proyecto usa **PostgreSQL con Neon.com**.

## Configuración

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con una de estas opciones:

**Opción 1: URL completa (Recomendado)**
```env
DATABASE_URL=postgresql://usuario:password@host:puerto/database?sslmode=require
```

**Opción 2: Variables individuales**
```env
DB_HOST=tu-host.neon.tech
DB_PORT=5432
DB_NAME=tu_database
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_SSL=true
```

### 2. Tu Connection String de Neon

Tu connection string debería verse así:
```
postgresql://neondb_owner:npg_CaGlt4eE3nrw@ep-hidden-cake-ahzw9yiu-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

Cópialo en tu `.env` como:
```env
DATABASE_URL=postgresql://neondb_owner:npg_CaGlt4eE3nrw@ep-hidden-cake-ahzw9yiu-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Uso

### En un Repositorio

```javascript
const DatabaseConnection = require('../infrastructure/database/DatabaseConnection');

class UserRepository {
  constructor() {
    this.db = new DatabaseConnection();
  }

  async findById(id) {
    const result = await this.db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async create(userData) {
    const result = await this.db.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [userData.name, userData.email]
    );
    return result.rows[0];
  }
}
```

### Ejecutar Queries

```javascript
const dbConnection = require('./infrastructure/database/DatabaseConnection');
const db = new DatabaseConnection();
await db.connect();

// Query simple
const result = await db.query('SELECT * FROM users');

// Query con parámetros (prevención de SQL injection)
const user = await db.query(
  'SELECT * FROM users WHERE id = $1 AND email = $2',
  [userId, userEmail]
);

// Insert
const newUser = await db.query(
  'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
  ['Juan', 'juan@example.com']
);
```

## Notas Importantes

- ✅ Siempre usa parámetros (`$1`, `$2`, etc.) para prevenir SQL injection
- ✅ La conexión se maneja automáticamente al iniciar el servidor
- ✅ El pool de conexiones se gestiona automáticamente
- ✅ SSL está habilitado por defecto para Neon

