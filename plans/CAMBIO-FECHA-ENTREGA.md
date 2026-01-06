# Cambio de Fecha de Entrega con Notificación WhatsApp

## Descripción

Esta funcionalidad permite actualizar la fecha estimada de entrega de una orden y envía automáticamente una notificación por WhatsApp al cliente informándole del cambio.

## Características

- ✅ Edición de fecha de entrega desde la interfaz de usuario
- ✅ Actualización automática en la base de datos
- ✅ Notificación por WhatsApp al cliente
- ✅ Fallback a mensaje de texto si el template no existe
- ✅ Confirmación visual del envío

## Configuración Inicial

### 1. Crear el Template de WhatsApp (Opcional)

Si deseas usar un template personalizado en lugar del mensaje de texto simple:

```bash
cd backend
node --loader ./node_modules/esm/index.js scripts/createDeliveryDateTemplate.js
```

Este script creará un template llamado `cambio_fecha_entrega` con el siguiente formato:

```
Hola {{cliente_nombre}},

Te informamos que la fecha estimada de entrega de tu orden {{orden_numero}} ha sido actualizada.

📅 Nueva fecha de entrega: {{fecha_entrega}}

Gracias por tu confianza.
```

### 2. Variables de Entorno Necesarias

Asegúrate de tener configuradas estas variables en tu archivo `.env`:

```env
# Configuración WhatsApp (KAPSO)
KAPSO_API_KEY=tu_api_key
KAPSO_PHONE_NUMBER_ID=tu_phone_number_id
KAPSO_BUSINESS_ACCOUNT_ID=tu_business_account_id
KAPSO_BASE_URL=https://api.kapso.ai/meta/whatsapp
WHATSAPP_NOTIFICATIONS_ENABLED=true
```

## Uso

### Desde el Frontend

1. Navega al detalle de una orden
2. En la sección "Información de la Orden", busca el campo "🎯 Fecha Estimada de Entrega"
3. Haz clic en el botón de edición (✏️) junto a la fecha
4. Selecciona la nueva fecha usando el selector de fecha
5. Haz clic en guardar (💾)
6. Se mostrará una confirmación indicando si la notificación de WhatsApp fue enviada

### Desde la API

**Endpoint:** `PUT /api/ordenes/:id/fecha-entrega`

**Request:**
```json
{
  "fecha_estimada_entrega": "2026-01-15"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Fecha de entrega actualizada exitosamente",
  "data": {
    // Datos de la orden actualizada
  },
  "whatsapp": {
    "sent": true,
    "timestamp": "2026-01-05T10:30:00.000Z",
    "messageId": "wamid.xxx"
  }
}
```

## Flujo de Funcionamiento

1. **Usuario edita la fecha** en el frontend
2. **Frontend envía solicitud** al backend con la nueva fecha
3. **Backend actualiza** la fecha en la base de datos
4. **Backend obtiene** los datos del cliente asociado a la orden
5. **Backend intenta enviar** notificación por WhatsApp:
   - Primero intenta usar el template `cambio_fecha_entrega`
   - Si el template no existe, envía un mensaje de texto simple
6. **Backend responde** al frontend con el resultado
7. **Frontend muestra confirmación** al usuario
8. **Frontend recarga** los datos de la orden

## Notificación WhatsApp

### Con Template
Si el template existe, se envía con estos parámetros:
- `{{1}}`: Nombre completo del cliente
- `{{2}}`: Número de orden (ej: #123)
- `{{3}}`: Nueva fecha formateada (ej: "15 de enero de 2026")

### Sin Template (Fallback)
Si el template no existe, se envía este mensaje de texto:

```
Hola [Nombre del Cliente],

Te informamos que la fecha estimada de entrega de tu orden [#ID] ha sido actualizada.

📅 Nueva fecha de entrega: [Fecha]

Gracias por tu confianza.
```

## Consideraciones

- ✅ La notificación solo se envía si el cliente tiene un teléfono de contacto registrado
- ✅ Si WhatsApp está deshabilitado o no configurado, la fecha se actualiza pero no se envía notificación
- ✅ El formato del número de teléfono se ajusta automáticamente al formato internacional (+57...)
- ✅ La fecha se formatea en español (ej: "15 de enero de 2026")
- ✅ No se puede editar la fecha si la orden ya está en el estado final

## Troubleshooting

### La notificación no se envía

1. Verifica que `WHATSAPP_NOTIFICATIONS_ENABLED=true` en el `.env`
2. Verifica que las credenciales de KAPSO sean correctas
3. Verifica que el cliente tenga un teléfono de contacto registrado
4. Revisa los logs del backend para ver el error específico

### El template no existe

No es un error crítico. El sistema automáticamente enviará un mensaje de texto simple en su lugar.

Para crear el template:
```bash
node --loader ./node_modules/esm/index.js scripts/createDeliveryDateTemplate.js
```

### Error al actualizar la fecha

1. Verifica que el backend esté corriendo
2. Verifica que la fecha sea válida (formato: YYYY-MM-DD)
3. Verifica que la orden exista
4. Revisa los logs del backend

## Archivos Modificados/Creados

### Backend
- `backend/infrastructure/services/WhatsAppService.js` - Método `notifyDeliveryDateChange()`
- `backend/infrastructure/repositories/OrdenRepository.js` - Método `updateFechaEntrega()`
- `backend/presentation/controllers/OrdenController.js` - Método `updateFechaEntrega()`
- `backend/presentation/routes/orden.routes.js` - Nueva ruta PUT `/:id/fecha-entrega`
- `backend/scripts/createDeliveryDateTemplate.js` - Script para crear template

### Frontend
- `Frontend/src/components/orden/OrdenInfoCard.jsx` - Edición inline de fecha
- `Frontend/src/pages/OrdenDetail.jsx` - Callback para recargar datos

## Testing

Para probar la funcionalidad:

1. Asegúrate de tener WhatsApp configurado y habilitado
2. Crea una orden con un cliente que tenga teléfono de contacto
3. Ve al detalle de la orden
4. Edita la fecha de entrega
5. Verifica:
   - Que la fecha se actualice en la interfaz
   - Que aparezca la confirmación
   - Que el cliente reciba el mensaje de WhatsApp
   - Revisa los logs del backend para ver el resultado del envío
