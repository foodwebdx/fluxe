# Plan de Testing - Integración WhatsApp con KAPSO

## Objetivo
Validar que las notificaciones de WhatsApp se envían correctamente cuando cambia el estado de una orden.

## Pre-requisitos

### 1. Configuración de Templates
- [ ] Ejecutar script de creación de templates: `node backend/scripts/createWhatsAppTemplates.js`
- [ ] Esperar aprobación de Meta (24-48 horas)
- [ ] Verificar estado de templates en dashboard de KAPSO

### 2. Variables de Entorno
Verificar que estén configuradas en `.env`:
```bash
KAPSO_API_KEY=a5e07437ebe35fe68c3764dd80fde1281779ca5fc1baaa500f686c00cd2c8513
KAPSO_BASE_URL=https://api.kapso.ai/meta/whatsapp
KAPSO_PHONE_NUMBER_ID=867029193169302
KAPSO_BUSINESS_ACCOUNT_ID=2112611499275414
WHATSAPP_NOTIFICATIONS_ENABLED=true
```

### 3. Datos de Prueba
Crear un cliente de prueba con:
- Nombre completo
- Teléfono en formato: +57 316 6651673 (tu número de prueba)
- Correo electrónico válido

## Casos de Prueba

### Test 1: Verificar Configuración del Servicio

**Objetivo**: Validar que WhatsAppService está correctamente configurado

**Pasos**:
1. Abrir consola de Node.js
2. Ejecutar:
```javascript
const WhatsAppService = require('./backend/infrastructure/services/WhatsAppService').default;
console.log('Configurado:', WhatsAppService.isConfigured());
console.log('Phone Number ID:', WhatsAppService.phoneNumberId);
console.log('Business Account ID:', WhatsAppService.businessAccountId);
```

**Resultado Esperado**:
- `Configurado: true`
- Phone Number ID y Business Account ID deben mostrarse correctamente

---

### Test 2: Formateo de Números de Teléfono

**Objetivo**: Validar que los números se formatean correctamente

**Pasos**:
1. Probar diferentes formatos:
```javascript
const WhatsAppService = require('./backend/infrastructure/services/WhatsAppService').default;

console.log(WhatsAppService.formatPhoneNumber('316 6651673'));
console.log(WhatsAppService.formatPhoneNumber('57 316 6651673'));
console.log(WhatsAppService.formatPhoneNumber('+57 316 6651673'));
console.log(WhatsAppService.formatPhoneNumber('3166651673'));
```

**Resultado Esperado**:
- Todos deben retornar: `+573166651673`

---

### Test 3: Envío de Mensaje de Texto Simple

**Objetivo**: Validar que se pueden enviar mensajes de texto

**Pasos**:
1. Ejecutar:
```javascript
const WhatsAppService = require('./backend/infrastructure/services/WhatsAppService').default;

WhatsAppService.sendTextMessage('+573166651673', 'Mensaje de prueba desde Fluxe')
  .then(result => console.log('Resultado:', result))
  .catch(error => console.error('Error:', error));
```

**Resultado Esperado**:
- `sent: true`
- Recibir mensaje en WhatsApp
- `messageId` debe estar presente

---

### Test 4: Cambio de Estado con Notificación

**Objetivo**: Validar el flujo completo de cambio de estado con notificación

**Pre-requisitos**:
- Cliente de prueba creado con tu número
- Orden creada para ese cliente
- Template `cambio_estado_orden` aprobado

**Pasos**:
1. Desde el frontend o Postman, cambiar estado de una orden
2. Endpoint: `PUT /api/ordenes/:id/estado`
3. Body:
```json
{
  "nuevoEstadoId": 2,
  "usuarioId": 1
}
```

**Resultado Esperado**:
- Estado de la orden cambia exitosamente
- Se crea registro en historial
- Se recibe notificación en WhatsApp con formato:
  ```
  Hola [Nombre], tu orden #[ID] ha cambiado a estado: [Estado]
  ```
- En logs del servidor: `✅ Notificación WhatsApp enviada a...`

---

### Test 5: Manejo de Errores - Cliente sin Teléfono

**Objetivo**: Validar que el sistema no falla si el cliente no tiene teléfono

**Pasos**:
1. Crear cliente sin teléfono de contacto
2. Crear orden para ese cliente
3. Cambiar estado de la orden

**Resultado Esperado**:
- Estado cambia exitosamente
- En logs: `⚠️ No se envió notificación WhatsApp: no_phone_number`
- No se lanza error

---

### Test 6: Manejo de Errores - Servicio Deshabilitado

**Objetivo**: Validar comportamiento cuando el servicio está deshabilitado

**Pasos**:
1. Cambiar en `.env`: `WHATSAPP_NOTIFICATIONS_ENABLED=false`
2. Reiniciar servidor
3. Cambiar estado de una orden

**Resultado Esperado**:
- Estado cambia exitosamente
- En logs: `WhatsApp notifications disabled or not configured`
- No se intenta enviar mensaje

---

### Test 7: Manejo de Errores - Template No Aprobado

**Objetivo**: Validar comportamiento cuando el template no está aprobado

**Pasos**:
1. Cambiar estado de orden antes de que Meta apruebe el template

**Resultado Esperado**:
- Estado cambia exitosamente
- Error en logs pero no afecta el flujo
- `sent: false` con mensaje de error de KAPSO

---

### Test 8: Múltiples Cambios de Estado

**Objetivo**: Validar que se envían múltiples notificaciones correctamente

**Pasos**:
1. Cambiar estado de orden a "En Proceso"
2. Esperar recibir notificación
3. Cambiar estado a "Completado"
4. Esperar recibir notificación

**Resultado Esperado**:
- Se reciben 2 notificaciones diferentes
- Cada una con el estado correcto
- No hay duplicados

---

### Test 9: Formato de Número Internacional

**Objetivo**: Validar que funciona con números de otros países

**Pasos**:
1. Crear cliente con número de otro país (ej: +1 555 1234567)
2. Cambiar estado de orden

**Resultado Esperado**:
- Número se mantiene en formato original
- Mensaje se envía correctamente (si el número es válido)

---

### Test 10: Rendimiento - No Bloquea el Flujo

**Objetivo**: Validar que el envío de WhatsApp no bloquea el cambio de estado

**Pasos**:
1. Medir tiempo de respuesta del endpoint sin WhatsApp habilitado
2. Habilitar WhatsApp
3. Medir tiempo de respuesta del endpoint con WhatsApp habilitado

**Resultado Esperado**:
- Diferencia de tiempo < 100ms
- La respuesta HTTP se envía antes de que termine el envío de WhatsApp

---

## Checklist de Validación Final

- [ ] Templates creados y aprobados en KAPSO
- [ ] Variables de entorno configuradas correctamente
- [ ] Servicio WhatsApp se inicializa sin errores
- [ ] Números de teléfono se formatean correctamente
- [ ] Mensajes de texto simples se envían correctamente
- [ ] Notificaciones de cambio de estado se envían correctamente
- [ ] Sistema maneja correctamente clientes sin teléfono
- [ ] Sistema maneja correctamente servicio deshabilitado
- [ ] Errores de KAPSO no afectan el flujo principal
- [ ] Logs muestran información clara sobre envíos

## Monitoreo en Producción

### Métricas a Observar
1. **Tasa de envío exitoso**: % de notificaciones enviadas vs intentadas
2. **Tiempo de respuesta**: Impacto en el tiempo de cambio de estado
3. **Errores comunes**: Tipos de errores más frecuentes

### Logs a Revisar
```bash
# Ver logs de notificaciones enviadas
grep "Notificación WhatsApp enviada" logs/app.log

# Ver logs de errores
grep "Error enviando notificación WhatsApp" logs/app.log

# Ver logs de servicio deshabilitado
grep "WhatsApp notifications disabled" logs/app.log
```

## Troubleshooting

### Problema: No se reciben mensajes
**Soluciones**:
1. Verificar que el template está aprobado
2. Verificar formato del número de teléfono
3. Revisar límites de rate de la cuenta KAPSO
4. Verificar que `WHATSAPP_NOTIFICATIONS_ENABLED=true`

### Problema: Error "Template not found"
**Soluciones**:
1. Ejecutar script de creación de templates
2. Esperar aprobación de Meta
3. Verificar nombre del template en el código

### Problema: Error "Invalid phone number"
**Soluciones**:
1. Verificar formato del número (debe incluir código de país)
2. Usar método `formatPhoneNumber()` del servicio
3. Validar que el número es válido en WhatsApp

## Notas Importantes

- Los templates pueden tardar 24-48 horas en ser aprobados por Meta
- Solo se pueden enviar mensajes a números que han iniciado conversación con el negocio (para pruebas)
- Verificar límites de mensajes según el tier de la cuenta KAPSO
- En desarrollo, usar `WHATSAPP_NOTIFICATIONS_ENABLED=false` para evitar envíos accidentales
