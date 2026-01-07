# 🚀 Próximos Pasos para Completar el Deployment

**Fecha:** 2026-01-07  
**Estado:** Configuración base completada ✅  
**Pendiente:** Refactorizar URLs del frontend + Configurar Vercel

---

## ✅ Lo que YA está hecho

1. **✅ Configuración de Vercel** - [`vercel.json`](../vercel.json) creado
2. **✅ Serverless Handler** - [`api/index.js`](../api/index.js) creado
3. **✅ Backend adaptado** - [`backend/index.js`](../backend/index.js) modificado para serverless
4. **✅ CORS configurado** - Permite solo dominios autorizados
5. **✅ Connection pooling** - Ya estaba configurado en PrismaService
6. **✅ Configuración de API** - [`Frontend/src/config/api.js`](../Frontend/src/config/api.js) creado
7. **✅ Variables de entorno** - `.env.development` y `.env.production` creados
8. **✅ Script de build** - `vercel-build` agregado a Frontend/package.json

---

## 🔴 Lo que FALTA hacer

### 1. Refactorizar URLs del Frontend (CRÍTICO)

Debes cambiar **56 ubicaciones** donde se usa `http://localhost:3000` por `apiUrl()`.

#### Archivos a modificar:

**Páginas (8 archivos):**
- [ ] `Frontend/src/pages/Login.jsx`
- [ ] `Frontend/src/pages/Ordenes.jsx`
- [ ] `Frontend/src/pages/OrdenDetail.jsx`
- [ ] `Frontend/src/pages/Clientes.jsx`
- [ ] `Frontend/src/pages/Productos.jsx`
- [ ] `Frontend/src/pages/Flujos.jsx`
- [ ] `Frontend/src/pages/Estados.jsx`
- [ ] `Frontend/src/pages/Usuarios.jsx`

**Componentes (4 archivos):**
- [ ] `Frontend/src/components/orden/EvidenciasSection.jsx`
- [ ] `Frontend/src/components/orden/EstadosTimeline.jsx`
- [ ] `Frontend/src/components/orden/ComentariosSection.jsx`
- [ ] `Frontend/src/components/orden/OrdenInfoCard.jsx`

#### Patrón de cambio:

**ANTES:**
```javascript
const response = await fetch('http://localhost:3000/api/ordenes');
```

**DESPUÉS:**
```javascript
import { apiUrl } from '../config/api'; // o '../../config/api' según la ubicación

const response = await fetch(apiUrl('/api/ordenes'));
```

#### Script para ayudarte:

Puedes usar este comando para encontrar todas las ocurrencias:
```bash
cd Frontend/src
grep -r "http://localhost:3000" .
```

---

### 2. Configurar Variables de Entorno en Vercel

Una vez que hagas el deployment, debes configurar estas variables en Vercel Dashboard:

#### Ir a: Project Settings → Environment Variables

**Variables requeridas:**

```env
# Database (Neon) - IMPORTANTE: Usar URL con pooling
DATABASE_URL=postgresql://user:pass@host-pooler.neon.tech/db?sslmode=require

# Node Environment
NODE_ENV=production

# Frontend URL (para CORS)
FRONTEND_URL=https://tu-proyecto.vercel.app

# AWS S3
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=tu_access_key_aqui
AWS_SECRET_ACCESS_KEY=tu_secret_key_aqui
AWS_S3_BUCKET_NAME=fluxe-evidencias-prod

# WhatsApp KAPSO
KAPSO_API_KEY=tu_api_key_aqui
KAPSO_BASE_URL=https://api.kapso.ai/meta/whatsapp
KAPSO_PHONE_NUMBER_ID=tu_phone_number_id_aqui
KAPSO_BUSINESS_ACCOUNT_ID=tu_business_account_id_aqui
WHATSAPP_NOTIFICATIONS_ENABLED=true
```

**⚠️ IMPORTANTE sobre DATABASE_URL:**

1. Ve a tu proyecto en Neon Dashboard
2. En "Connection Details", selecciona **"Pooled connection"**
3. Copia la URL que incluye `-pooler` en el hostname
4. Ejemplo: `postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/db`

---

### 3. Hacer el Deployment

#### Opción A: Desde la interfaz de Vercel (Recomendado)

1. **Commit y push de cambios:**
   ```bash
   git add .
   git commit -m "feat: Configurar proyecto para deployment en Vercel"
   git push origin main
   ```

2. **Ir a Vercel:**
   - https://vercel.com
   - Click en "Add New Project"
   - Importar repositorio `foodwebdx/fluxe`

3. **Configurar proyecto:**
   - Framework Preset: **Vite**
   - Root Directory: **Frontend**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Agregar variables de entorno** (ver sección 2)

5. **Click en "Deploy"**

#### Opción B: Desde CLI de Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Seguir las instrucciones
```

---

### 4. Verificar el Deployment

Una vez deployado, probar estas URLs:

```bash
# Frontend
https://tu-proyecto.vercel.app

# Backend API
https://tu-proyecto.vercel.app/api

# Health check
https://tu-proyecto.vercel.app/health

# Endpoint específico
https://tu-proyecto.vercel.app/api/ordenes
```

**Checklist de verificación:**
- [ ] Frontend carga correctamente
- [ ] Login funciona
- [ ] Puede crear órdenes
- [ ] Puede ver órdenes
- [ ] Puede cambiar estados
- [ ] Puede subir evidencias (S3)
- [ ] Recibe notificaciones WhatsApp
- [ ] No hay errores de CORS en consola

---

## 🛠️ Comandos Útiles

### Desarrollo local (sigue funcionando igual)

```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd Frontend
npm run dev
```

### Ver logs de Vercel

```bash
vercel logs
```

### Rollback si algo sale mal

En Vercel Dashboard:
1. Ir a "Deployments"
2. Click en deployment anterior
3. Click en "Promote to Production"

---

## 🐛 Troubleshooting Rápido

### Error: "Too many connections"
**Solución:** Verifica que estés usando la URL con `-pooler` de Neon

### Error: CORS
**Solución:** Verifica que `FRONTEND_URL` esté configurada en Vercel

### Error: "Module not found"
**Solución:** Verifica que todas las dependencias estén en `package.json`

### Error: Timeout
**Solución:** Aumenta `maxDuration` en `vercel.json` a 30 segundos

---

## 📊 Resumen de Archivos Creados/Modificados

### ✅ Archivos Creados (7)
- `vercel.json` - Configuración de Vercel
- `api/index.js` - Serverless handler
- `Frontend/src/config/api.js` - Configuración de API URL
- `Frontend/.env.development` - Variables de desarrollo
- `Frontend/.env.production` - Variables de producción
- `plans/VERCEL-DEPLOYMENT-PLAN.md` - Plan completo
- `plans/DEPLOYMENT-NEXT-STEPS.md` - Este archivo

### ✅ Archivos Modificados (2)
- `backend/index.js` - Adaptado para serverless
- `Frontend/package.json` - Agregado script `vercel-build`

### 🔴 Archivos Pendientes de Modificar (12)
- 8 páginas del frontend
- 4 componentes del frontend

---

## 🎯 Orden Recomendado de Ejecución

1. **Refactorizar URLs del frontend** (30-60 minutos)
   - Modificar los 12 archivos listados
   - Probar localmente que todo sigue funcionando

2. **Commit y push** (5 minutos)
   ```bash
   git add .
   git commit -m "feat: Refactorizar URLs para producción"
   git push origin main
   ```

3. **Configurar Vercel** (10-15 minutos)
   - Crear proyecto en Vercel
   - Configurar variables de entorno
   - Deploy

4. **Verificar y probar** (15-30 minutos)
   - Probar todas las funcionalidades
   - Verificar logs
   - Ajustar si es necesario

**Tiempo total estimado:** 1-2 horas

---

## 💡 Consejos

- **Haz un branch:** `git checkout -b deployment/vercel` antes de empezar
- **Prueba local primero:** Verifica que todo funciona en desarrollo
- **Deploy gradual:** Primero deploy a "Preview", luego a "Production"
- **Monitorea logs:** Revisa los logs de Vercel después del deploy
- **Ten paciencia:** El primer deploy puede tardar 3-5 minutos

---

**Siguiente paso:** Refactorizar URLs del frontend (ver sección 1)

**Documentación completa:** [`plans/VERCEL-DEPLOYMENT-PLAN.md`](./VERCEL-DEPLOYMENT-PLAN.md)
