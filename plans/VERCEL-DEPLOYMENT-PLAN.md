# 🚀 Plan de Deployment Completo a Vercel

**Fecha:** 2026-01-07  
**Estrategia:** Opción B - Todo en Vercel (Monorepo con Serverless Backend)  
**Base de Datos:** Neon PostgreSQL (ya configurada) ✅

---

## 📋 Resumen Ejecutivo

### ¿Qué vamos a hacer?

Migrar tu aplicación fullstack (Frontend React + Backend Express) a Vercel usando:
- **Frontend**: Deploy estático de Vite
- **Backend**: Serverless Functions (adaptación de Express)
- **Base de Datos**: Neon PostgreSQL (sin cambios)
- **Servicios externos**: AWS S3 + WhatsApp (sin cambios)

### Arquitectura Actual vs Nueva

```
ACTUAL (Desarrollo)
┌─────────────────────────────────────┐
│  Frontend (Vite)                    │
│  http://localhost:5173              │
└──────────────┬──────────────────────┘
               │ fetch()
               ↓
┌─────────────────────────────────────┐
│  Backend (Express)                  │
│  http://localhost:3000              │
│  - app.listen(3000)                 │
│  - Servidor persistente             │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│  Neon PostgreSQL                    │
│  (Cloud)                            │
└─────────────────────────────────────┘

NUEVA (Producción en Vercel)
┌─────────────────────────────────────┐
│  Frontend (Vercel CDN)              │
│  https://fluxe.vercel.app           │
└──────────────┬──────────────────────┘
               │ fetch()
               ↓
┌─────────────────────────────────────┐
│  Backend (Vercel Functions)         │
│  https://fluxe.vercel.app/api/*     │
│  - Serverless (sin app.listen)      │
│  - Cold starts (~1-2s primera vez)  │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│  Neon PostgreSQL                    │
│  (Cloud - sin cambios)              │
└─────────────────────────────────────┘
```

---

## 🎯 Objetivos del Plan

1. ✅ **Mantener funcionalidad completa** - Todo debe seguir funcionando
2. ✅ **Minimizar cambios de código** - Adaptar, no reescribir
3. ✅ **Optimizar para serverless** - Connection pooling, caching
4. ✅ **Configuración correcta** - Variables de entorno, CORS, routing
5. ✅ **Documentación clara** - Paso a paso reproducible

---

## 📊 Análisis de Impacto

### ✅ Lo que NO necesita cambios

- ✅ **Base de datos Neon** - Ya está en cloud
- ✅ **Modelos Prisma** - Funcionan igual
- ✅ **Lógica de negocio** - Use cases, repositories
- ✅ **AWS S3** - Sigue funcionando
- ✅ **WhatsApp KAPSO** - Sigue funcionando
- ✅ **Clean Architecture** - Se mantiene intacta

### ⚠️ Lo que SÍ necesita cambios

- 🔴 **Backend index.js** - Eliminar `app.listen()`, exportar app
- 🔴 **Frontend URLs** - Cambiar de `localhost:3000` a variable de entorno
- 🔴 **Conexión a DB** - Agregar connection pooling para Neon
- 🔴 **CORS** - Configurar para dominio de producción
- 🔴 **Configuración Vercel** - Crear `vercel.json`
- 🟡 **Multer** - Verificar límites de payload (4.5MB en Vercel)

---

## 🗂️ Estructura del Proyecto

### Actual
```
fluxe/
├── backend/
│   ├── index.js                    ← Servidor Express tradicional
│   ├── application/
│   ├── domain/
│   ├── infrastructure/
│   └── presentation/
├── Frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── prisma/
├── package.json                    ← Backend package.json
└── .env
```

### Nueva (para Vercel)
```
fluxe/
├── api/
│   └── index.js                    ← Nuevo: Serverless handler
├── backend/
│   ├── index.js                    ← Modificado: Exporta app sin listen
│   ├── application/
│   ├── domain/
│   ├── infrastructure/
│   │   └── database/
│   │       └── db.js               ← Modificado: Connection pooling
│   └── presentation/
├── Frontend/
│   ├── src/
│   │   └── config/
│   │       └── api.js              ← Nuevo: Configuración de API URL
│   ├── .env.production             ← Nuevo: Variables de producción
│   ├── package.json
│   └── vite.config.js
├── prisma/
├── package.json
├── vercel.json                     ← Nuevo: Configuración de Vercel
└── .env
```

---

## 📝 Plan de Implementación Detallado

### FASE 1: Preparación del Backend (Serverless)

#### 1.1 Modificar `backend/index.js`

**Problema actual:**
```javascript
// backend/index.js (ACTUAL)
const app = express();
// ... middlewares y rutas ...

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app; // ← Esto está bien
```

**Solución:**
```javascript
// backend/index.js (NUEVO)
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

// Database connection (singleton)
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
```

#### 1.2 Crear `api/index.js` (Serverless Handler)

**Crear nuevo archivo:**
```javascript
// api/index.js
const app = require('../backend/index');

// Vercel serverless handler
module.exports = app;
```

**¿Por qué este archivo?**
- Vercel busca funciones en la carpeta `/api`
- Este archivo actúa como punto de entrada serverless
- Importa tu app Express y la expone como función

#### 1.3 Optimizar Conexión a Neon (Connection Pooling)

**Problema:**
- Serverless crea nueva conexión en cada request
- Neon tiene límite de conexiones
- Sin pooling = errores "too many connections"

**Solución: Modificar `backend/infrastructure/database/db.js`**

```javascript
// backend/infrastructure/database/db.js
const { PrismaClient } = require('@prisma/client');

let prisma;

function getDatabase() {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Configuración para serverless
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    // Connection pooling para Neon
    if (process.env.NODE_ENV === 'production') {
      // Neon recomienda usar connection pooling
      // La URL de Neon ya incluye pooling si usas el formato correcto
      console.log('✅ Prisma configurado con connection pooling para producción');
    }
  }

  return {
    prisma,
    connect: async () => {
      try {
        await prisma.$connect();
        console.log('✅ Conectado a la base de datos');
        return true;
      } catch (error) {
        console.error('❌ Error conectando a la base de datos:', error);
        throw error;
      }
    },
    disconnect: async () => {
      try {
        await prisma.$disconnect();
        console.log('✅ Desconectado de la base de datos');
      } catch (error) {
        console.error('❌ Error desconectando de la base de datos:', error);
      }
    },
    healthCheck: async () => {
      try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
      } catch (error) {
        console.error('❌ Health check falló:', error);
        return false;
      }
    },
  };
}

module.exports = { getDatabase };
```

**Configuración de Neon:**
Tu `DATABASE_URL` debe usar el formato con pooling:
```env
# Formato CON pooling (recomendado para Vercel)
DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require&pgbouncer=true"

# O usar la URL de pooling directa de Neon
DATABASE_URL="postgresql://user:pass@host-pooler.neon.tech/db?sslmode=require"
```

---

### FASE 2: Configuración de Vercel

#### 2.1 Crear `vercel.json`

**Crear en la raíz del proyecto:**

```json
{
  "version": 2,
  "name": "fluxe",
  "builds": [
    {
      "src": "Frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/Frontend/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "api/index.js": {
      "maxDuration": 10,
      "memory": 1024
    }
  }
}
```

**Explicación:**
- `builds`: Define cómo construir el frontend
- `routes`: Enruta `/api/*` al backend, resto al frontend
- `functions`: Configuración de serverless (10s timeout, 1GB RAM)

#### 2.2 Modificar `Frontend/package.json`

**Agregar script de build:**

```json
{
  "name": "frontend",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "vercel-build": "vite build"
  }
}
```

---

### FASE 3: Refactorizar Frontend (URLs Dinámicas)

#### 3.1 Crear archivo de configuración de API

**Crear `Frontend/src/config/api.js`:**

```javascript
// Frontend/src/config/api.js

// Detectar entorno
const isDevelopment = import.meta.env.MODE === 'development';

// URL base del API
export const API_BASE_URL = isDevelopment
  ? 'http://localhost:3000'
  : import.meta.env.VITE_API_URL || '';

// Helper para construir URLs
export const apiUrl = (path) => {
  // Asegurar que path empiece con /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // En producción, las rutas son relativas (mismo dominio)
  if (!isDevelopment) {
    return normalizedPath;
  }
  
  // En desarrollo, usar localhost
  return `${API_BASE_URL}${normalizedPath}`;
};

// Exportar por defecto
export default {
  baseURL: API_BASE_URL,
  url: apiUrl,
};
```

#### 3.2 Crear `.env` files para Frontend

**`Frontend/.env.development`:**
```env
VITE_API_URL=http://localhost:3000
```

**`Frontend/.env.production`:**
```env
# En producción, el API está en el mismo dominio
VITE_API_URL=
```

#### 3.3 Refactorizar TODOS los fetch() del Frontend

**Ejemplo de cambio en un archivo:**

**ANTES:**
```javascript
// Frontend/src/pages/Ordenes.jsx
const response = await fetch('http://localhost:3000/api/ordenes');
```

**DESPUÉS:**
```javascript
// Frontend/src/pages/Ordenes.jsx
import { apiUrl } from '../config/api';

const response = await fetch(apiUrl('/api/ordenes'));
```

**Lista de archivos a modificar (56 ubicaciones):**
- `Frontend/src/pages/Login.jsx`
- `Frontend/src/pages/Ordenes.jsx`
- `Frontend/src/pages/OrdenDetail.jsx`
- `Frontend/src/pages/Clientes.jsx`
- `Frontend/src/pages/Productos.jsx`
- `Frontend/src/pages/Flujos.jsx`
- `Frontend/src/pages/Estados.jsx`
- `Frontend/src/pages/Usuarios.jsx`
- `Frontend/src/components/orden/EvidenciasSection.jsx`
- `Frontend/src/components/orden/EstadosTimeline.jsx`
- `Frontend/src/components/orden/ComentariosSection.jsx`
- `Frontend/src/components/orden/OrdenInfoCard.jsx`

---

### FASE 4: Variables de Entorno en Vercel

#### 4.1 Variables que debes configurar en Vercel Dashboard

**Ir a:** Project Settings → Environment Variables

**Variables requeridas:**

```env
# Database (Neon)
DATABASE_URL=postgresql://user:pass@host-pooler.neon.tech/db?sslmode=require

# Node Environment
NODE_ENV=production

# Frontend URL (para CORS)
FRONTEND_URL=https://fluxe.vercel.app

# AWS S3
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_S3_BUCKET_NAME=fluxe-evidencias-prod

# WhatsApp KAPSO
KAPSO_API_KEY=tu_api_key
KAPSO_BASE_URL=https://api.kapso.ai/meta/whatsapp
KAPSO_PHONE_NUMBER_ID=tu_phone_number_id
KAPSO_BUSINESS_ACCOUNT_ID=tu_business_account_id
WHATSAPP_NOTIFICATIONS_ENABLED=true
```

**⚠️ IMPORTANTE:**
- NO subas el archivo `.env` a Git
- Configura cada variable manualmente en Vercel
- Usa "Production", "Preview" y "Development" según necesites

#### 4.2 Obtener DATABASE_URL con Pooling de Neon

1. Ir a tu proyecto en Neon Dashboard
2. En "Connection Details", seleccionar **"Pooled connection"**
3. Copiar la URL que incluye `-pooler` en el hostname
4. Ejemplo: `postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/db`

---

### FASE 5: Configuración de CORS para Producción

**Ya incluido en el `backend/index.js` modificado:**

```javascript
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
  // ... resto del código
});
```

**Esto permite:**
- ✅ Requests desde tu dominio de Vercel
- ✅ Requests desde localhost en desarrollo
- ❌ Bloquea requests de otros dominios

---

## 🚀 Proceso de Deployment

### Paso 1: Preparar el Código

```bash
# 1. Asegurar que estás en la rama correcta
git checkout main

# 2. Crear rama para deployment
git checkout -b deployment/vercel

# 3. Hacer todos los cambios del plan
# (modificar archivos según las fases anteriores)

# 4. Commit de cambios
git add .
git commit -m "feat: Configurar proyecto para deployment en Vercel"

# 5. Push a GitHub
git push origin deployment/vercel
```

### Paso 2: Conectar con Vercel

1. **Ir a:** https://vercel.com
2. **Click en:** "Add New Project"
3. **Importar:** Tu repositorio de GitHub `foodwebdx/fluxe`
4. **Configurar:**
   - Framework Preset: **Vite**
   - Root Directory: **Frontend** (como ya lo tienes)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Paso 3: Configurar Variables de Entorno

En Vercel Dashboard:
1. Ir a **Settings** → **Environment Variables**
2. Agregar TODAS las variables del `.env`
3. Seleccionar scope: **Production**, **Preview**, **Development**

### Paso 4: Deploy

1. **Click en:** "Deploy"
2. **Esperar:** Build process (~2-5 minutos)
3. **Verificar:** Logs de build

### Paso 5: Verificar Deployment

**URLs a probar:**
```bash
# Frontend
https://fluxe.vercel.app

# Backend API
https://fluxe.vercel.app/api

# Health check
https://fluxe.vercel.app/health

# Endpoint específico
https://fluxe.vercel.app/api/ordenes
```

---

## ✅ Checklist de Verificación Post-Deployment

### Backend
- [ ] `/health` responde correctamente
- [ ] `/api` muestra endpoints disponibles
- [ ] Conexión a Neon funciona
- [ ] Prisma queries funcionan
- [ ] AWS S3 uploads funcionan
- [ ] WhatsApp notifications funcionan
- [ ] CORS permite requests del frontend

### Frontend
- [ ] Página principal carga
- [ ] Login funciona
- [ ] Puede crear órdenes
- [ ] Puede ver órdenes
- [ ] Puede cambiar estados
- [ ] Puede subir evidencias
- [ ] Puede agregar comentarios
- [ ] No hay errores de CORS en consola

### Performance
- [ ] Primera carga < 3 segundos
- [ ] Cold start del API < 2 segundos
- [ ] Requests subsecuentes < 500ms
- [ ] Imágenes cargan correctamente

---

## 🐛 Troubleshooting Común

### Error: "Too many connections" en Neon

**Causa:** No estás usando connection pooling

**Solución:**
```env
# Cambiar DATABASE_URL a la versión con pooling
DATABASE_URL="postgresql://user:pass@host-pooler.neon.tech/db?sslmode=require"
```

### Error: "Function timeout" (10 segundos)

**Causa:** Operación muy lenta

**Soluciones:**
1. Optimizar queries de Prisma
2. Agregar índices en Neon
3. Aumentar timeout en `vercel.json`:
```json
{
  "functions": {
    "api/index.js": {
      "maxDuration": 30
    }
  }
}
```

### Error: CORS en producción

**Causa:** Frontend URL no está en allowedOrigins

**Solución:**
```bash
# Verificar variable de entorno en Vercel
FRONTEND_URL=https://fluxe.vercel.app
```

### Error: "Module not found" en build

**Causa:** Dependencia faltante

**Solución:**
```bash
# Verificar que todas las dependencias estén en package.json
npm install
```

### Error: Multer "File too large"

**Causa:** Vercel tiene límite de 4.5MB por request

**Solución:**
```javascript
// backend/presentation/middlewares/upload.js
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 4 * 1024 * 1024, // 4MB (bajo el límite de Vercel)
  },
});
```

---

## 📊 Comparación: Antes vs Después

### Desarrollo (Local)
```
✅ Sin cambios
- npm run dev (backend)
- npm run dev (frontend)
- Todo funciona igual
```

### Producción (Vercel)
```
ANTES (No existía)
❌ No había producción

DESPUÉS (Vercel)
✅ Frontend: https://fluxe.vercel.app
✅ Backend: https://fluxe.vercel.app/api
✅ Base de datos: Neon (sin cambios)
✅ CDN global
✅ HTTPS automático
✅ Deploy automático en cada push
```

---

## 🎯 Próximos Pasos Después del Deployment

### Inmediato
1. ✅ Verificar que todo funciona
2. ✅ Probar todas las funcionalidades críticas
3. ✅ Monitorear logs en Vercel Dashboard
4. ✅ Configurar dominio personalizado (opcional)

### Corto Plazo
1. Configurar Analytics de Vercel
2. Configurar alertas de errores
3. Optimizar performance (caching, lazy loading)
4. Agregar monitoring (Sentry, LogRocket)

### Mediano Plazo
1. Implementar CI/CD completo
2. Agregar tests automatizados
3. Configurar staging environment
4. Documentar proceso de rollback

---

## 📚 Recursos y Referencias

### Documentación Oficial
- **Vercel**: https://vercel.com/docs
- **Vercel Serverless Functions**: https://vercel.com/docs/functions/serverless-functions
- **Neon Connection Pooling**: https://neon.tech/docs/connect/connection-pooling
- **Prisma with Vercel**: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel

### Tutoriales Útiles
- Deploying Express to Vercel: https://vercel.com/guides/using-express-with-vercel
- Vite + Vercel: https://vitejs.dev/guide/static-deploy.html#vercel

---

## 🔐 Seguridad

### Variables de Entorno
- ✅ Nunca commitear `.env` a Git
- ✅ Usar variables de entorno de Vercel
- ✅ Rotar secrets regularmente
- ✅ Usar diferentes valores para dev/prod

### CORS
- ✅ Solo permitir tu dominio
- ✅ No usar `*` en producción
- ✅ Validar origin en cada request

### Rate Limiting
```javascript
// Considerar agregar en el futuro
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de requests
});

app.use('/api/', limiter);
```

---

## 💰 Costos Estimados

### Vercel
- **Plan Hobby (Gratis)**:
  - 100 GB bandwidth
  - Serverless function executions: 100 GB-Hrs
  - Build time: 100 horas/mes
  - **Suficiente para empezar** ✅

- **Plan Pro ($20/mes)**:
  - 1 TB bandwidth
  - Serverless: 1000 GB-Hrs
  - Mejor para producción

### Neon
- **Plan Free**:
  - 0.5 GB storage
  - 1 proyecto
  - **Suficiente para desarrollo** ✅

- **Plan Pro ($19/mes)**:
  - 10 GB storage
  - Mejor performance
  - Connection pooling

### AWS S3
- **Pay as you go**:
  - ~$0.023 por GB almacenado
  - ~$0.09 por GB transferido
  - **Estimado: $5-10/mes** para uso moderado

### Total Estimado
- **Desarrollo/MVP**: $0/mes (planes gratuitos)
- **Producción**: $25-50/mes

---

## 📞 Soporte

### Si algo sale mal:

1. **Revisar logs de Vercel**:
   - Dashboard → Deployments → Click en deployment → Logs

2. **Revisar logs de Neon**:
   - Neon Dashboard → Monitoring

3. **Debugging local**:
   ```bash
   # Simular producción localmente
   NODE_ENV=production npm start
   ```

4. **Rollback**:
   - Vercel Dashboard → Deployments → Click en deployment anterior → "Promote to Production"

---

**Creado:** 2026-01-07  
**Autor:** Arquitecto del Sistema  
**Estado:** ✅ Listo para implementación  
**Versión:** 1.0.0
