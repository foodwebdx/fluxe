# Fluxe Backend

Backend desarrollado con Clean Architecture usando Node.js y JavaScript, conectado a PostgreSQL mediante Neon.com.

## 🏗️ Estructura del Proyecto

```
fluxe/
├── backend/                   # Código del backend
│   ├── domain/                # Capa de Dominio (Lógica de negocio pura)
│   │   ├── entities/          # Entidades del dominio
│   │   │   ├── BaseEntity.js  # Entidad base
│   │   │   └── Cliente.js     # Entidad Cliente
│   │   ├── repositories/      # Interfaces de repositorios
│   │   │   ├── IBaseRepository.js
│   │   │   └── IClienteRepository.js
│   │   └── usecases/          # Interfaces de casos de uso
│   │       └── IUseCase.js
│   │
│   ├── application/           # Capa de Aplicación (Casos de uso)
│   │   ├── dtos/              # Data Transfer Objects
│   │   │   └── BaseDTO.js
│   │   └── usecases/          # Implementación de casos de uso
│   │       ├── cliente/
│   │       │   └── GetClientesUseCase.js
│   │       └── example/
│   │           └── ExampleUseCase.js
│   │
│   ├── infrastructure/         # Capa de Infraestructura (Implementaciones técnicas)
│   │   ├── database/           # Conexiones y configuraciones de BD
│   │   │   ├── DatabaseConnection.js
│   │   │   ├── db.js          # Singleton para compartir conexión
│   │   │   └── IDatabaseConnection.js
│   │   └── repositories/      # Implementación de repositorios
│   │       └── ClienteRepository.js
│   │
│   ├── presentation/           # Capa de Presentación (API REST)
│   │   ├── controllers/        # Controladores
│   │   │   ├── ClienteController.js
│   │   │   └── ExampleController.js
│   │   ├── routes/             # Rutas de la API
│   │   │   ├── cliente.routes.js
│   │   │   ├── example.routes.js
│   │   │   └── index.js
│   │   └── middlewares/         # Middlewares de Express
│   │       ├── errorHandler.js
│   │       ├── notFound.js
│   │       └── requestLogger.js
│   │
│   └── index.js                # Punto de entrada de la aplicación
│
├── package.json
├── .env
└── README.md
```

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Configuración

1. Crea un archivo `.env` en la raíz del proyecto:
```bash
cp .env.example .env
```

2. Configura las variables de entorno (ver sección de Variables de Entorno más abajo).

### Ejecutar en desarrollo

```bash
npm run dev
```

### Ejecutar en producción

```bash
npm start
```

## 📝 Scripts Disponibles

- `npm run dev` - Inicia el servidor en modo desarrollo con watch
- `npm start` - Inicia el servidor en modo producción
- `npm test` - Ejecuta los tests
- `npm run lint` - Verifica el código con ESLint
- `npm run lint:fix` - Corrige automáticamente errores de ESLint

## 🔧 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

### Variables Requeridas

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration - Opción 1: URL completa (Recomendado)
DATABASE_URL=postgresql://usuario:password@host:puerto/database?sslmode=require

# Database Configuration - Opción 2: Variables individuales
# DB_HOST=tu-host.neon.tech
# DB_PORT=5432
# DB_NAME=tu_database
# DB_USER=tu_usuario
# DB_PASSWORD=tu_password
# DB_SSL=true
```

### Variables Opcionales

```env
# Configuración del Pool de Conexiones (Opcional)
DB_POOL_MAX=20                    # Máximo de conexiones simultáneas (default: 20)
DB_POOL_IDLE_TIMEOUT=30000        # Tiempo en ms antes de cerrar conexiones inactivas (default: 30000)
DB_POOL_CONNECTION_TIMEOUT=2000   # Tiempo en ms para establecer conexión (default: 2000)
```

## 📡 Endpoints Disponibles

### Información General

- `GET /` - Información de la API y endpoints disponibles
- `GET /health` - Health check del servidor y estado de la base de datos

### API Endpoints

- `GET /api` - Información sobre los endpoints de la API
- `GET /api/example` - Información sobre el endpoint de ejemplo
- `POST /api/example` - Endpoint de ejemplo

### Clientes

- `GET /api/clientes` - Obtener todos los clientes

### Ejemplo de Respuesta

```json
{
  "success": true,
  "message": "Clientes obtenidos exitosamente",
  "data": [
    {
      "id_cliente": 1,
      "tipo_identificacion": "CC",
      "numero_identificacion": "123456789",
      "nombre_completo": "Juan Pérez",
      "telefono_contacto": "3001234567",
      "correo_electronico": "juan@example.com",
      "tipo_direccion": "Domicilio",
      "direccion": "Calle 123 #45-67",
      "notas_cliente": "Cliente frecuente"
    }
  ],
  "count": 1
}
```

## 🗄️ Base de Datos

Este proyecto está configurado para usar **PostgreSQL con Neon.com**.

### Configuración

1. Obtén tu connection string de Neon.com
2. Agrega `DATABASE_URL` a tu archivo `.env`
3. El servidor se conectará automáticamente al iniciar

### Uso de Repositorios

Los repositorios siguen el patrón de Clean Architecture:

```javascript
const ClienteRepository = require('./backend/infrastructure/repositories/ClienteRepository');

class MyUseCase {
  constructor() {
    this.clienteRepository = new ClienteRepository();
  }

  async execute() {
    // Obtener todos los clientes
    const clientes = await this.clienteRepository.findAll();
    
    // Obtener un cliente por ID
    const cliente = await this.clienteRepository.findById(1);
    
    // Crear un cliente
    const nuevoCliente = await this.clienteRepository.create({
      tipo_identificacion: 'CC',
      numero_identificacion: '123456789',
      nombre_completo: 'Juan Pérez',
      telefono_contacto: '3001234567',
      correo_electronico: 'juan@example.com',
      tipo_direccion: 'Domicilio',
      direccion: 'Calle 123',
      notas_cliente: 'Notas del cliente'
    });
    
    return clientes;
  }
}
```

### Estructura de la Tabla Clientes

```sql
CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    tipo_identificacion VARCHAR(20) NOT NULL,
    numero_identificacion VARCHAR(50) NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    telefono_contacto VARCHAR(50) NOT NULL,
    correo_electronico VARCHAR(255) NOT NULL UNIQUE,
    tipo_direccion VARCHAR(50),
    direccion TEXT,
    notas_cliente TEXT,
    UNIQUE (tipo_identificacion, numero_identificacion)
);
```

## 🏛️ Clean Architecture

Este proyecto sigue los principios de Clean Architecture:

1. **Domain Layer**: Contiene la lógica de negocio pura, sin dependencias externas.
   - Entidades: Representan los objetos de negocio
   - Interfaces: Definen contratos sin implementación

2. **Application Layer**: Contiene los casos de uso que orquestan la lógica de negocio.
   - Casos de uso: Implementan la lógica de aplicación
   - DTOs: Objetos para transferencia de datos

3. **Infrastructure Layer**: Implementa las interfaces definidas en el dominio.
   - Repositorios: Implementación de acceso a datos
   - Conexiones: Configuración de bases de datos

4. **Presentation Layer**: Maneja las peticiones HTTP y las respuestas.
   - Controladores: Manejan las peticiones HTTP
   - Rutas: Definen los endpoints
   - Middlewares: Procesan las peticiones

### Reglas de Dependencias

- ✅ Las capas externas pueden depender de las internas, pero nunca al revés
- ✅ El dominio no debe conocer nada sobre Express, bases de datos, etc.
- ✅ Las dependencias siempre apuntan hacia adentro
- ✅ Las interfaces se definen en el dominio y se implementan en la infraestructura

## 📦 Dependencias Principales

- **express**: Framework web para Node.js
- **dotenv**: Manejo de variables de entorno
- **pg**: Cliente PostgreSQL para Node.js

## 🧪 Testing

```bash
npm test
```

## 🔧 Próximos Pasos

- [x] Configurar base de datos (PostgreSQL con Neon)
- [x] Implementar estructura de Clean Architecture
- [x] Crear endpoint GET para clientes
- [ ] Implementar autenticación y autorización
- [ ] Agregar validación de datos (Joi, Zod, etc.)
- [ ] Crear endpoints POST, PUT, DELETE para clientes
- [ ] Configurar tests unitarios e integración
- [ ] Agregar documentación de API (Swagger/OpenAPI)
- [ ] Implementar logging avanzado
- [ ] Configurar CI/CD

## 📄 Licencia

ISC
