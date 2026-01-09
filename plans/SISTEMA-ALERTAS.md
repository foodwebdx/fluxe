# Sistema de Alertas de Órdenes

Sistema automático de notificaciones para alertar a los administradores sobre órdenes próximas a su fecha de entrega.

## 🎯 Funcionalidad

El sistema verifica diariamente las órdenes que están próximas a su `fecha_estimada_entrega` y envía notificaciones automáticas a los usuarios con rol de **Admin**.

### Criterios de Alerta

- **Alertas Medias**: 2 días antes de la fecha de entrega
- **Alertas Altas**: 1 día antes de la fecha de entrega (mañana)
- **Alertas Críticas**: El mismo día de la entrega (hoy)

### Canales de Notificación

1. **Email (SMTP)**: Resumen completo con todas las órdenes
2. **WhatsApp**: Solo para alertas críticas y altas (urgentes)

## 📋 Componentes

### 1. CheckOrdenAlertasUseCase
**Ubicación**: `backend/application/usecases/orden/CheckOrdenAlertasUseCase.js`

Caso de uso que verifica qué órdenes requieren alerta.

```javascript
const resultado = await checkAlertasUseCase.execute({ diasAntes: 2 });
// Retorna: { success, ordenes, total, admins, fecha_verificacion }
```

### 2. AlertasService
**Ubicación**: `backend/infrastructure/services/AlertasService.js`

Servicio que formatea y envía las notificaciones a los administradores.

**Métodos principales:**
- `generarMensajeAlerta(orden)`: Formatea el mensaje de WhatsApp
- `generarCuerpoEmailResumen(ordenes)`: Genera el resumen de email
- `enviarAlertas(ordenes, admins)`: Envía todas las notificaciones

### 3. AlertasScheduler
**Ubicación**: `backend/infrastructure/schedulers/AlertasScheduler.js`

Programador que ejecuta automáticamente las verificaciones usando cron jobs.

**Horarios de Ejecución:**
- **8:00 AM**: Verificación matutina (2 días antes)
- **2:00 PM**: Verificación vespertina (2 días antes)
- **6:00 PM**: Verificación crítica (1 día o menos)

**Zona horaria**: America/Bogota

## ⚙️ Configuración

### Variables de Entorno

```env
# Ejecutar verificación al iniciar el servidor (opcional)
RUN_ALERTS_ON_STARTUP=false

# WhatsApp (ya configurado)
WHATSAPP_NOTIFICATIONS_ENABLED=true
KAPSO_API_KEY=your_api_key
KAPSO_PHONE_NUMBER_ID=your_phone_number_id

# Email (ya configurado)
EMAIL_NOTIFICATIONS_ENABLED=true
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM="Fluxe <no-reply@fluxe.com>"
```

### Inicio Automático

El sistema se inicia automáticamente con el servidor en desarrollo:

```javascript
// backend/index.js
const alertasScheduler = getAlertasScheduler();
alertasScheduler.start();
```

## 🔧 API Endpoints

### GET /api/alertas/status
Obtiene el estado del sistema de alertas.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "active": true,
    "jobs": 3,
    "timezone": "America/Bogota",
    "schedules": [
      { "name": "Matutino", "time": "08:00", "dias_antes": 2 },
      { "name": "Vespertino", "time": "14:00", "dias_antes": 2 },
      { "name": "Crítico", "time": "18:00", "dias_antes": 1 }
    ]
  }
}
```

### POST /api/alertas/ejecutar
Ejecuta manualmente la verificación de alertas (útil para pruebas).

**Respuesta:**
```json
{
  "success": true,
  "message": "Verificación de alertas ejecutada correctamente",
  "data": {
    "total_ordenes": 3,
    "admins_notificados": 2,
    "fecha_verificacion": "2026-01-09T00:30:00.000Z"
  }
}
```

## 📱 Formato de Notificaciones

### WhatsApp (Solo urgentes)

```
🚨 *ALERTA DE ORDEN PRÓXIMA A VENCER* 🚨

*Orden:* #123
*Cliente:* Juan Pérez
*Producto:* Notebook Dell
*Estado Actual:* En Reparación
*Fecha de Entrega:* jueves, 9 de enero de 2026
*Días Restantes:* 0 día(s)
*Nivel de Urgencia:* CRITICO

⏰ *LA ENTREGA ES HOY* - Acción inmediata requerida

*Descripción:* Reparación de pantalla
```

### Email (Todas las órdenes)

```
ALERTA DE ÓRDENES PRÓXIMAS A VENCER
================================================

Se han detectado 5 orden(es) que requieren atención:

🚨 CRÍTICAS (Entrega hoy): 2
   - Orden #123: Juan Pérez
   - Orden #124: María García

⚠️ ALTAS (Entrega mañana): 2
   - Orden #125: Pedro López
   - Orden #126: Ana Martínez

📋 MEDIAS (2 días): 1
   - Orden #127: Carlos Sánchez

Fecha de verificación: 9/1/2026, 8:00:00 a.m.

Por favor, revise estas órdenes en el sistema Fluxe.
```

## 🧪 Pruebas

### 1. Ejecutar Verificación Manual

```bash
# Usando curl
curl -X POST http://localhost:3000/api/alertas/ejecutar

# Usando el frontend o Postman
POST /api/alertas/ejecutar
```

### 2. Verificar Estado del Sistema

```bash
curl http://localhost:3000/api/alertas/status
```

### 3. Crear Órdenes de Prueba

Para probar el sistema, crea órdenes con:
- `fecha_estimada_entrega` = Hoy + 1 día (alerta alta)
- `fecha_estimada_entrega` = Hoy + 2 días (alerta media)
- `fecha_cierre` = null (orden activa)

## 👥 Configuración de Administradores

Para que un usuario reciba alertas, debe tener un rol de administrador:

1. El usuario debe tener un rol con `nombre_rol` = 'Admin', 'Administrador', 'ADMIN' o 'ADMINISTRADOR'
2. Debe tener configurado:
   - `email` para recibir notificaciones por email
   - `telefono` para recibir notificaciones por WhatsApp

**Consulta para verificar admins:**
```sql
SELECT u.* FROM usuarios u
JOIN usuarios_roles ur ON u.id_usuario = ur.id_usuario
JOIN roles r ON ur.id_rol = r.id_rol
WHERE r.nombre_rol IN ('Admin', 'Administrador', 'ADMIN', 'ADMINISTRADOR');
```

## 🔄 Flujo de Operación

```
1. Cron Job se ejecuta (8:00 AM, 2:00 PM, 6:00 PM)
   ↓
2. CheckOrdenAlertasUseCase verifica órdenes
   ↓
3. Filtra órdenes con fecha_estimada_entrega próxima
   ↓
4. Obtiene lista de administradores
   ↓
5. AlertasService formatea mensajes
   ↓
6. Envía notificaciones:
   - Email: Resumen a todos los admins
   - WhatsApp: Solo urgentes
   ↓
7. Registra resultado en logs
```

## 📊 Logs del Sistema

El sistema genera logs detallados:

```
⏰ Iniciando verificación de alertas de órdenes...
🔍 Buscando órdenes entre 2026-01-08 y 2026-01-10
📊 Resultado de verificación:
   - Total de órdenes con alerta: 3
   - Admins a notificar: 2
📤 Enviando alertas de 3 orden(es) a 2 admin(s)
✅ Alertas enviadas: 5 notificaciones
   📧 Emails: 2
   📱 WhatsApp: 3
⏱️ Verificación completada en 2.34 segundos
```

## ⚠️ Importante

- **Solo en desarrollo**: El sistema solo se inicia automáticamente cuando `NODE_ENV !== 'production'`
- **Producción (Vercel)**: Los cron jobs no funcionan en serverless. En producción, considera:
  - Vercel Cron Jobs
  - Servicios externos como cron-job.org
  - AWS EventBridge
  - Google Cloud Scheduler

## 🚀 Mejoras Futuras

- [ ] Persistir registro de notificaciones enviadas
- [ ] Dashboard de alertas en el frontend
- [ ] Configuración personalizada de horarios por admin
- [ ] Notificaciones por Telegram
- [ ] Reportes semanales de órdenes atrasadas
- [ ] Integración con calendario (Google Calendar, Outlook)

## 🆘 Troubleshooting

### Las alertas no se envían

1. Verificar que hay usuarios con rol Admin
2. Verificar que los admins tienen email y/o teléfono
3. Verificar configuración de SMTP y WhatsApp en `.env`
4. Revisar logs del servidor

### Los cron jobs no se ejecutan

1. Verificar que `node-cron` está instalado: `npm list node-cron`
2. Verificar que el servidor está corriendo en desarrollo
3. Ejecutar manualmente: `POST /api/alertas/ejecutar`

### No se encuentran órdenes con alerta

1. Verificar que existen órdenes con `fecha_estimada_entrega` próxima
2. Verificar que `fecha_cierre` es null (orden activa)
3. Ejecutar query manual en la BD para verificar datos

---

**Autor**: Sistema Fluxe  
**Versión**: 1.0.0  
**Fecha**: Enero 2026
