# 🚀 Inicio Rápido - Notificaciones WhatsApp

## Pasos para Activar las Notificaciones

### 1️⃣ Verificar Variables de Entorno

Las variables ya están configuradas en [`.env`](../.env):
```env
KAPSO_API_KEY=a5e07437ebe35fe68c3764dd80fde1281779ca5fc1baaa500f686c00cd2c8513
KAPSO_BASE_URL=https://api.kapso.ai/meta/whatsapp
KAPSO_PHONE_NUMBER_ID=867029193169302
KAPSO_BUSINESS_ACCOUNT_ID=2112611499275414
WHATSAPP_NOTIFICATIONS_ENABLED=true
```

✅ **Ya está configurado** - No necesitas hacer nada aquí.

---

### 2️⃣ Crear Templates en KAPSO

Ejecuta el script para crear los templates:

```bash
node backend/scripts/createWhatsAppTemplates.js
```

**Resultado esperado**:
```
🚀 Iniciando creación de templates de WhatsApp...
✅ Configuración verificada
📱 Business Account ID: 2112611499275414
📞 Phone Number ID: 867029193169302

📝 Creando template: cambio_estado_orden...
✅ Template "cambio_estado_orden" creado exitosamente

📝 Creando template: orden_creada...
✅ Template "orden_creada" creado exitosamente

📝 Creando template: orden_completada...
✅ Template "orden_completada" creado exitosamente

📝 Creando template: orden_en_proceso...
✅ Template "orden_en_proceso" creado exitosamente

📊 RESUMEN DE CREACIÓN DE TEMPLATES
=====================================
✅ Exitosos: 4
❌ Fallidos: 0
📝 Total: 4

⏳ IMPORTANTE: Los templates deben ser aprobados por Meta
   Este proceso puede tomar 24-48 horas.
```

⏳ **Esperar 24-48 horas** para que Meta apruebe los templates.

---

### 3️⃣ Verificar Configuración

Prueba que el servicio está configurado correctamente:

```bash
node -e "const WS = require('./backend/infrastructure/services/WhatsAppService').default; console.log('✅ Configurado:', WS.isConfigured()); console.log('📞 Phone ID:', WS.phoneNumberId);"
```

**Resultado esperado**:
```
✅ Configurado: true
📞 Phone ID: 867029193169302
```

---

### 4️⃣ Prueba de Envío (Opcional)

Una vez aprobados los templates, prueba enviar un mensaje:

```bash
node -e "const WS = require('./backend/infrastructure/services/WhatsAppService').default; WS.sendTextMessage('+573166651673', '¡Hola! Prueba desde Fluxe 🚀').then(r => console.log('Resultado:', r));"
```

**Resultado esperado**:
```
Resultado: { sent: true, timestamp: 2026-01-05T..., messageId: 'wamid.xxx...' }
```

Y deberías recibir el mensaje en WhatsApp (+57 316 6651673).

---

### 5️⃣ Probar Cambio de Estado

1. **Crear un cliente de prueba** con tu número de teléfono:
   - Nombre: Tu nombre
   - Teléfono: +57 316 6651673

2. **Crear una orden** para ese cliente

3. **Cambiar el estado** de la orden desde el frontend o API:
   ```bash
   curl -X PUT http://localhost:3000/api/ordenes/1/estado \
     -H "Content-Type: application/json" \
     -d '{"nuevoEstadoId": 2, "usuarioId": 1}'
   ```

4. **Verificar**:
   - ✅ El estado cambió en la base de datos
   - ✅ Recibiste un mensaje en WhatsApp
   - ✅ En los logs del servidor aparece: `✅ Notificación WhatsApp enviada a...`

---

## 📋 Checklist de Activación

- [x] SDK de KAPSO instalado (`@kapso/whatsapp-cloud-api`)
- [x] Variables de entorno configuradas
- [ ] Templates creados en KAPSO (ejecutar script)
- [ ] Templates aprobados por Meta (esperar 24-48h)
- [ ] Prueba de envío exitosa
- [ ] Prueba de cambio de estado con notificación

---

## 🔧 Troubleshooting Rápido

### ❌ Error: "Template not found"
**Causa**: Los templates no han sido aprobados por Meta  
**Solución**: Esperar 24-48 horas después de crear los templates

### ❌ Error: "Invalid phone number"
**Causa**: Formato incorrecto del número  
**Solución**: Usar formato internacional: `+573166651673`

### ❌ No se reciben mensajes
**Causa**: Servicio deshabilitado o templates no aprobados  
**Solución**: 
1. Verificar `WHATSAPP_NOTIFICATIONS_ENABLED=true`
2. Verificar que templates estén aprobados
3. Revisar logs del servidor

### ⚠️ "WhatsApp notifications disabled"
**Causa**: Variable de entorno en `false`  
**Solución**: Cambiar a `WHATSAPP_NOTIFICATIONS_ENABLED=true` y reiniciar servidor

---

## 📚 Documentación Completa

- **Implementación**: [`WHATSAPP-IMPLEMENTATION.md`](./WHATSAPP-IMPLEMENTATION.md)
- **Templates**: [`WHATSAPP-TEMPLATES.md`](./WHATSAPP-TEMPLATES.md)
- **Testing**: [`WHATSAPP-TESTING-PLAN.md`](./WHATSAPP-TESTING-PLAN.md)

---

## 🎯 Próximos Pasos

1. ✅ Ejecutar script de creación de templates
2. ⏳ Esperar aprobación de Meta (24-48 horas)
3. 🧪 Realizar pruebas según el plan de testing
4. 🚀 Activar en producción

---

## 💡 Consejos

- **En desarrollo**: Puedes deshabilitar las notificaciones con `WHATSAPP_NOTIFICATIONS_ENABLED=false`
- **Logs**: Revisa los logs del servidor para ver el estado de cada notificación
- **Formato**: El sistema formatea automáticamente los números de teléfono
- **Errores**: Los errores de WhatsApp no afectan el cambio de estado de las órdenes

---

**¿Necesitas ayuda?** Revisa la documentación completa o los logs del servidor para más detalles.
