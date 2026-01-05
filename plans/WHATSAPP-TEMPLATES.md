# Templates de WhatsApp para KAPSO

Este documento describe los templates de mensajes de WhatsApp que deben ser creados en KAPSO para las notificaciones de cambio de estado de órdenes.

## Información de la Cuenta

- **Business Account ID**: 2112611499275414
- **Phone Number ID**: 867029193169302
- **Idioma**: Español (es_MX)
- **Categoría**: UTILITY (para notificaciones transaccionales)

## Templates Requeridos

### 1. Template: `cambio_estado_orden`

**Propósito**: Notificar al cliente cuando cambia el estado de su orden.

**Categoría**: UTILITY

**Idioma**: es_MX

**Formato de Parámetros**: NAMED

**Componentes**:

#### Body
```
Hola {{cliente_nombre}}, tu orden {{orden_numero}} ha cambiado a estado: {{nuevo_estado}}
```

**Parámetros**:
- `cliente_nombre` - Nombre completo del cliente
- `orden_numero` - Número de la orden (ej: #123)
- `nuevo_estado` - Nombre del nuevo estado

**Ejemplo**:
```
Hola Juan Pérez, tu orden #123 ha cambiado a estado: En Proceso
```

---

### 2. Template: `orden_creada`

**Propósito**: Confirmar la creación de una nueva orden.

**Categoría**: UTILITY

**Idioma**: es_MX

**Formato de Parámetros**: NAMED

**Componentes**:

#### Body
```
¡Hola {{cliente_nombre}}! Tu orden {{orden_numero}} ha sido creada exitosamente. Te mantendremos informado sobre su progreso.
```

**Parámetros**:
- `cliente_nombre` - Nombre completo del cliente
- `orden_numero` - Número de la orden

**Ejemplo**:
```
¡Hola Juan Pérez! Tu orden #123 ha sido creada exitosamente. Te mantendremos informado sobre su progreso.
```

---

### 3. Template: `orden_completada`

**Propósito**: Notificar que la orden ha sido completada.

**Categoría**: UTILITY

**Idioma**: es_MX

**Formato de Parámetros**: NAMED

**Componentes**:

#### Body
```
¡Excelente noticia {{cliente_nombre}}! Tu orden {{orden_numero}} ha sido completada. Gracias por confiar en nosotros.
```

**Parámetros**:
- `cliente_nombre` - Nombre completo del cliente
- `orden_numero` - Número de la orden

**Ejemplo**:
```
¡Excelente noticia Juan Pérez! Tu orden #123 ha sido completada. Gracias por confiar en nosotros.
```

---

### 4. Template: `orden_en_proceso`

**Propósito**: Notificar que la orden está siendo procesada.

**Categoría**: UTILITY

**Idioma**: es_MX

**Formato de Parámetros**: NAMED

**Componentes**:

#### Body
```
Hola {{cliente_nombre}}, tu orden {{orden_numero}} está ahora en proceso. Estimamos completarla el {{fecha_estimada}}.
```

**Parámetros**:
- `cliente_nombre` - Nombre completo del cliente
- `orden_numero` - Número de la orden
- `fecha_estimada` - Fecha estimada de entrega

**Ejemplo**:
```
Hola Juan Pérez, tu orden #123 está ahora en proceso. Estimamos completarla el 15/01/2026.
```

---

## Proceso de Aprobación

1. Los templates deben ser creados usando la API de KAPSO o el dashboard
2. Meta debe aprobar cada template (puede tomar 24-48 horas)
3. Solo templates aprobados pueden ser usados para enviar mensajes
4. Los templates de categoría UTILITY son para notificaciones transaccionales

## Notas Importantes

- **Formato de números**: Los números de teléfono deben estar en formato internacional (+57XXXXXXXXXX)
- **Límites de rate**: Verificar los límites de mensajes por día según el tier de la cuenta
- **Políticas de WhatsApp**: Los mensajes deben cumplir con las políticas de WhatsApp Business
- **Parámetros nombrados**: Usar `parameter_format: "NAMED"` para mejor legibilidad
- **Ejemplos requeridos**: Meta requiere ejemplos para aprobar los templates

## Uso en el Código

Los templates se usan en el [`WhatsAppService.js`](../backend/infrastructure/services/WhatsAppService.js):

```javascript
await whatsAppService.notifyStatusChange(cliente, orden, nuevoEstado);
```

El servicio automáticamente:
- Formatea el número de teléfono
- Selecciona el template apropiado
- Rellena los parámetros
- Maneja errores sin afectar el flujo principal
