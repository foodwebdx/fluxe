# Prisma ORM Integration Guide

This project uses Prisma ORM for database operations with PostgreSQL (Neon).

## 📋 Overview

Prisma has been integrated following Clean Architecture principles:
- **PrismaService**: Wrapper class for managing Prisma Client lifecycle
- **Repository Pattern**: All database operations go through repositories
- **Singleton Pattern**: Single Prisma Client instance across the application

## 🚀 Quick Start

### Available Scripts

```bash
# Generate Prisma Client
npm run prisma:generate

# Open Prisma Studio (Database GUI)
npm run prisma:studio

# Pull schema from database
npm run prisma:pull

# Push schema changes to database
npm run prisma:push

# Create and run migrations
npm run prisma:migrate
```

## 📁 Project Structure

```
.
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   └── migrations/            # Database migrations (if using migrate)
├── backend/
│   └── infrastructure/
│       ├── database/
│       │   ├── PrismaService.js    # Prisma Client wrapper
│       │   └── db.js               # Singleton pattern for Prisma
│       └── repositories/
│           └── ClienteRepository.js # Using Prisma for DB operations
└── .env                        # DATABASE_URL configuration
```

## 🔧 Configuration

### Environment Variables

Ensure your `.env` file contains:

```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
```

### Schema Configuration

The `schema.prisma` file is configured with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}
```

Database URL is configured in `prisma.config.ts`:

```typescript
datasource: {
  url: env("DATABASE_URL"),
}
```

## 📊 Current Models

**Total:** 12 modelos sincronizados desde Neon
**Última actualización:** 2025-12-24

### Core Models

1. **clientes** - Gestión de clientes
2. **productos** - Productos de clientes
3. **ordenes** - Órdenes de servicio
4. **flujos** - Flujos de trabajo
5. **estados** - Estados del flujo
6. **flujos_estados** - Configuración de flujos
7. **historial_estados_orden** - Trazabilidad de cambios
8. **comentarios_estado** - Comentarios en cambios
9. **evidencias** - Archivos y documentos
10. **usuarios** - Usuarios del sistema
11. **roles** - Roles de usuario
12. **usuarios_roles** - Asignación de roles

Para ver el detalle completo de cada modelo, consulta [`MODELS_SUMMARY.md`](./MODELS_SUMMARY.md).

### Ejemplo de Modelo con Relaciones

```prisma
model ordenes {
  id_orden                Int                       @id @default(autoincrement())
  id_cliente              Int
  id_producto             Int
  id_flujo                Int
  id_estado_actual        Int
  descripcion_servicio    String?
  condiciones_pago        String?
  fecha_creacion          DateTime                  @default(now())
  fecha_estimada_entrega  DateTime?
  fecha_cierre            DateTime?
  notas_orden             String?
  
  // Relaciones
  evidencias              evidencias[]
  historial_estados_orden historial_estados_orden[]
  clientes                clientes                  @relation(...)
  estados                 estados                   @relation(...)
  flujos                  flujos                    @relation(...)
  productos               productos                 @relation(...)
}
```

## 💻 Usage Examples

### Using in Repository

```javascript
const { getPrisma } = require('../database/db');

class ClienteRepository {
  getPrisma() {
    return getPrisma();
  }

  async findAll() {
    const clientes = await this.getPrisma().clientes.findMany({
      orderBy: { id_cliente: 'desc' }
    });
    return clientes.map(cliente => new Cliente(cliente));
  }

  async findById(id) {
    const cliente = await this.getPrisma().clientes.findUnique({
      where: { id_cliente: parseInt(id) }
    });
    return cliente ? new Cliente(cliente) : null;
  }

  async create(data) {
    const nuevoCliente = await this.getPrisma().clientes.create({
      data: {
        tipo_identificacion: data.tipo_identificacion,
        numero_identificacion: data.numero_identificacion,
        nombre_completo: data.nombre_completo,
        telefono_contacto: data.telefono_contacto,
        correo_electronico: data.correo_electronico,
        tipo_direccion: data.tipo_direccion || null,
        direccion: data.direccion || null,
        notas_cliente: data.notas_cliente || null
      }
    });
    return new Cliente(nuevoCliente);
  }

  async update(id, data) {
    try {
      const clienteActualizado = await this.getPrisma().clientes.update({
        where: { id_cliente: parseInt(id) },
        data: data
      });
      return new Cliente(clienteActualizado);
    } catch (error) {
      if (error.code === 'P2025') {
        // Record not found
        return null;
      }
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.getPrisma().clientes.delete({
        where: { id_cliente: parseInt(id) }
      });
      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }
}
```

## 🔄 Workflow

### Adding a New Model

1. **Update schema.prisma**:
   ```prisma
   model productos {
     id        Int      @id @default(autoincrement())
     nombre    String
     precio    Decimal
     createdAt DateTime @default(now())
   }
   ```

2. **Push to database**:
   ```bash
   npm run prisma:push
   ```

3. **Generate Prisma Client**:
   ```bash
   npm run prisma:generate
   ```

4. **Create Repository**:
   ```javascript
   const { getPrisma } = require('../database/db');
   
   class ProductoRepository {
     getPrisma() {
       return getPrisma();
     }
     
     async findAll() {
       return await this.getPrisma().productos.findMany();
     }
   }
   ```

### Pulling Changes from Database

If the database schema changes externally:

```bash
npm run prisma:pull
npm run prisma:generate
```

## 🛠️ Common Prisma Operations

### Querying

```javascript
// Find many with filters
await prisma.clientes.findMany({
  where: {
    tipo_identificacion: 'CC',
    correo_electronico: { contains: '@gmail.com' }
  },
  orderBy: { nombre_completo: 'asc' },
  take: 10,
  skip: 0
});

// Find unique
await prisma.clientes.findUnique({
  where: { id_cliente: 1 }
});

// Find first
await prisma.clientes.findFirst({
  where: { tipo_identificacion: 'CC' }
});
```

### Creating

```javascript
await prisma.clientes.create({
  data: {
    tipo_identificacion: 'CC',
    numero_identificacion: '12345678',
    nombre_completo: 'Juan Pérez',
    telefono_contacto: '3001234567',
    correo_electronico: 'juan@example.com'
  }
});
```

### Updating

```javascript
await prisma.clientes.update({
  where: { id_cliente: 1 },
  data: { telefono_contacto: '3009876543' }
});
```

### Deleting

```javascript
await prisma.clientes.delete({
  where: { id_cliente: 1 }
});
```

## 🎯 Best Practices

1. **Always use try-catch blocks** for error handling
2. **Handle Prisma error codes**:
   - `P2025`: Record not found
   - `P2002`: Unique constraint violation
   - `P2003`: Foreign key constraint violation
3. **Use transactions** for multiple related operations
4. **Close connections** on application shutdown (handled by PrismaService)
5. **Use select/include** to optimize queries

## 📚 Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Client API Reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma Error Reference](https://www.prisma.io/docs/reference/api-reference/error-reference)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

## 🐛 Troubleshooting

### Prisma Client out of sync

```bash
npm run prisma:generate
```

### Database connection issues

Check your `DATABASE_URL` in `.env` and ensure the database is accessible.

### Schema changes not reflected

```bash
npm run prisma:pull
npm run prisma:generate
```
