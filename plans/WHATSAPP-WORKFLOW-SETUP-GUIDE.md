# Guía de Configuración del Workflow de Bienvenida en KAPSO

## ✅ Template Creado

El template `orden_seguimiento` ha sido creado exitosamente y está pendiente de aprobación por Meta (24-48 horas).

## 📋 Pasos para Configurar el Workflow

### Paso 1: Acceder al Dashboard de KAPSO

1. Ir a: https://app.kapso.ai
2. Iniciar sesión con tus credenciales
3. Navegar a la sección **"Workflows"** o **"Flows"**

### Paso 2: Crear Nuevo Workflow

1. Click en **"Create New Workflow"** o **"New Flow"**
2. Nombre del workflow: `Bienvenida Automática`
3. Descripción: `Responde automáticamente cuando un cliente escribe por primera vez`

### Paso 3: Configurar el Trigger

1. En la sección de **Triggers**, seleccionar **"WhatsApp Message Trigger"**
2. Configuración del trigger:
   ```
   Trigger Type: WhatsApp Message
   WhatsApp Number: 867029193169302 (o seleccionar de la lista)
   Active: ✅ Activado
   ```

3. **Importante**: Solo puede haber un workflow activo con trigger de WhatsApp por número
   - Si ya tienes otro workflow activo, debes desactivarlo primero

### Paso 4: Agregar Step - Send Template

1. Click en **"Add Step"** o **"+"**
2. Seleccionar tipo de step: **"Send Template Message"**
3. Configurar el step:

```
Step Name: Enviar Bienvenida
Template: orden_seguimiento
To Phone Number: {{context.phone_number}}
Language: es_MX

Parameters:
  - Parameter Name: link
    Type: text
    Value: https://fluxe.app/seguimiento/PLACEHOLDER
```

### Paso 5: Configuración Avanzada (Opcional)

#### Opción A: Responder Solo al Primer Mensaje

Si quieres que solo responda al primer mensaje de una conversación:

1. Agregar step **"Condition"** antes del Send Template
2. Configurar condición:
   ```
   If: {{context.message_count}} == 1
   Then: Send Template
   Else: Do Nothing
   ```

#### Opción B: Responder a Cualquier Mensaje

Dejar el workflow simple con solo el step de Send Template.

### Paso 6: Guardar y Activar

1. Click en **"Save"** para guardar el workflow
2. Click en **"Activate"** o toggle para activar
3. Verificar que el estado sea **"Active"** ✅

## 🧪 Testing del Workflow

### Test 1: Enviar Mensaje de Prueba

1. Desde tu teléfono (+57 319 6695353), enviar un mensaje a: **+57 316 6651673**
2. Mensaje de prueba: `"Hola"`
3. Esperar respuesta automática

**Respuesta esperada**:
```
Hola, en este momento estamos trabajando en tu orden. En este link https://fluxe.app/seguimiento/PLACEHOLDER podrás ver comentarios, evidencias y el flujo de cómo va la orden. Cualquier actualización que se realice te la enviaremos por este canal.
```

### Test 2: Verificar en Dashboard

1. Ir a sección **"Workflow Executions"** o **"History"**
2. Verificar que aparece la ejecución del workflow
3. Revisar logs para confirmar que se envió correctamente

### Test 3: Múltiples Mensajes

1. Enviar otro mensaje
2. Verificar si responde de nuevo (depende de la configuración)

## 🔧 Troubleshooting

### Problema: No recibo respuesta automática

**Posibles causas**:
1. ✅ Template no aprobado aún → Esperar 24-48 horas
2. ✅ Workflow no activado → Verificar estado en dashboard
3. ✅ Trigger mal configurado → Revisar configuración del trigger
4. ✅ Número incorrecto → Verificar Phone Number ID

**Solución**:
```bash
# Verificar estado del template en dashboard
# Verificar que workflow esté "Active"
# Revisar logs de ejecución en KAPSO
```

### Problema: Template no encontrado

**Causa**: Template aún no aprobado por Meta

**Solución**: Esperar aprobación (24-48 horas)

### Problema: Error al activar workflow

**Causa**: Ya existe otro workflow activo con trigger de WhatsApp

**Solución**: 
1. Ir a lista de workflows
2. Desactivar el workflow anterior
3. Activar el nuevo workflow

## 📊 Monitoreo

### Métricas a Observar

1. **Tasa de respuesta**: % de mensajes que reciben respuesta automática
2. **Tiempo de respuesta**: Cuánto tarda en responder
3. **Errores**: Mensajes que no se enviaron correctamente

### Dashboard de KAPSO

Revisar regularmente:
- **Workflow Executions**: Historial de ejecuciones
- **Message Logs**: Logs de mensajes enviados
- **Error Logs**: Errores ocurridos

## 🎯 Configuración Recomendada

### Para Producción

```
Workflow Name: Bienvenida Automática
Status: Active ✅

Trigger:
  Type: WhatsApp Message
  Number: 867029193169302
  Active: Yes

Steps:
  1. Send Template
     - Template: orden_seguimiento
     - To: {{context.phone_number}}
     - Parameters:
       * link: https://fluxe.app/seguimiento/PLACEHOLDER
```

### Variables Disponibles

En el workflow puedes usar:

```javascript
// Información del cliente
{{context.phone_number}}       // +573196695353
{{last_user_input}}           // "Hola"
{{context.conversation_id}}   // ID único de la conversación

// Información del sistema
{{system.trigger_type}}       // "inbound_message"
{{system.workflow_id}}        // ID del workflow
```

## 📝 Próximos Pasos

### Fase 1: Configuración Básica (Ahora)
- ✅ Template creado
- ⏳ Esperar aprobación Meta
- 🔧 Configurar workflow en dashboard
- 🧪 Probar funcionamiento

### Fase 2: Link Dinámico (Futuro)
- Crear endpoint para obtener orden por teléfono
- Modificar workflow para incluir ID real de orden
- Actualizar parámetro `link` con URL dinámica

### Fase 3: Página de Seguimiento (Futuro)
- Crear página pública `/seguimiento/:ordenId`
- Mostrar: Timeline, comentarios, evidencias
- Sin autenticación (acceso público con ID)

## 🔗 Recursos

- **Dashboard KAPSO**: https://app.kapso.ai
- **Documentación Workflows**: https://docs.kapso.ai/flows/step-types/start-node
- **Documentación Triggers**: https://docs.kapso.ai/flows/triggers
- **Soporte KAPSO**: support@kapso.ai

## ✅ Checklist de Configuración

- [ ] Acceder a dashboard de KAPSO
- [ ] Crear nuevo workflow "Bienvenida Automática"
- [ ] Configurar trigger de WhatsApp Message
- [ ] Agregar step Send Template
- [ ] Configurar template "orden_seguimiento"
- [ ] Configurar parámetro link
- [ ] Guardar workflow
- [ ] Activar workflow
- [ ] Probar enviando mensaje
- [ ] Verificar respuesta automática
- [ ] Revisar logs en dashboard

---

**Nota**: Esta configuración se hace directamente en el dashboard web de KAPSO. No requiere código adicional en tu backend.
