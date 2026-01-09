# Componentes de Vista Detallada de Orden

## Descripción

Este módulo implementa una vista detallada de órdenes con línea de tiempo interactiva que muestra el historial de estados, permitiendo gestionar comentarios y evidencias por cada estado.

## Componentes

### 1. OrdenDetail.jsx (Página Principal)
**Ubicación:** `Frontend/src/pages/OrdenDetail.jsx`

**Props:**
- `ordenId` (Number): ID de la orden a mostrar
- `onVolver` (Function): Callback para regresar a la lista de órdenes

**Responsabilidades:**
- Cargar datos de la orden desde la API
- Cargar estados del flujo
- Cargar historial de estados
- Cargar evidencias
- Coordinar componentes hijos

**Endpoints utilizados:**
- `GET /api/ordenes/:id`
- `GET /api/flujos/:id/estados`
- `GET /api/historial/orden/:idOrden`
- `GET /api/evidencias/orden/:idOrden`

### 2. OrdenInfoCard.jsx
**Ubicación:** `Frontend/src/components/orden/OrdenInfoCard.jsx`

**Props:**
- `orden` (Object): Objeto con toda la información de la orden

**Muestra:**
- Información del cliente
- Información del producto
- Flujo de trabajo
- Estado actual
- Descripción del servicio
- Condiciones de pago
- Fechas (creación, entrega estimada, cierre)
- Notas adicionales

### 3. EstadosTimeline.jsx
**Ubicación:** `Frontend/src/components/orden/EstadosTimeline.jsx`

**Props:**
- `estadosFlujo` (Array): Estados del flujo
- `historial` (Array): Historial de cambios de estado
- `estadoActualId` (Number): ID del estado actual
- `ordenId` (Number): ID de la orden
- `evidencias` (Array): Evidencias de la orden
- `onEstadoChange` (Function): Callback cuando cambia el estado
- `onRefresh` (Function): Callback para refrescar datos

**Funcionalidades:**
- Clasifica estados en previos, actual y futuros
- Renderiza la línea de tiempo horizontal
- Maneja clicks en estados previos (abre modal)
- Maneja avance al siguiente estado
- Muestra modal de detalles de estado

### 4. TimelineEstado.jsx
**Ubicación:** `Frontend/src/components/orden/TimelineEstado.jsx`

**Props:**
- `estado` (Object): Información del estado
- `type` ('completed' | 'current' | 'pending'): Tipo de estado
- `ordenId` (Number): ID de la orden (solo para current)
- `evidencias` (Array): Evidencias del estado (solo para current)
- `onClick` (Function): Handler de click (solo para completed)
- `onAvanzar` (Function): Handler para avanzar (solo para pending)
- `onRefresh` (Function): Callback para refrescar (solo para current)

**Renderizado condicional:**
- **Completado:** Icono ✓, clickeable para ver detalles
- **Actual:** Icono ●, con secciones de comentarios y evidencias
- **Pendiente:** Icono ○, con botón "Avanzar" si es el siguiente

### 5. ComentariosSection.jsx
**Ubicación:** `Frontend/src/components/orden/ComentariosSection.jsx`

**Props:**
- `historialId` (Number): ID del registro de historial
- `comentarios` (Array): Lista de comentarios existentes
- `onRefresh` (Function): Callback para refrescar datos
- `readOnly` (Boolean): Si es solo lectura (default: false)

**Funcionalidades:**
- Muestra lista de comentarios existentes
- Formulario para agregar nuevo comentario (si no es readOnly)
- Integración con API de comentarios

**Endpoints:**
- `POST /api/comentarios`

### 6. EvidenciasSection.jsx
**Ubicación:** `Frontend/src/components/orden/EvidenciasSection.jsx`

**Props:**
- `ordenId` (Number): ID de la orden
- `estadoId` (Number): ID del estado
- `evidencias` (Array): Evidencias del estado
- `onRefresh` (Function): Callback para refrescar datos
- `readOnly` (Boolean): Si es solo lectura (default: false)

**Funcionalidades:**
- Muestra grid de evidencias existentes
- Preview de imágenes
- Zona de drag & drop para subir archivos (si no es readOnly)
- Integración con API de evidencias

**Endpoints:**
- `POST /api/evidencias`

### 7. EstadoModal.jsx
**Ubicación:** `Frontend/src/components/orden/EstadoModal.jsx`

**Props:**
- `estado` (Object): Información del estado
- `evidencias` (Array): Evidencias del estado
- `onClose` (Function): Callback para cerrar modal

**Funcionalidades:**
- Muestra detalles del estado previo
- Muestra comentarios en modo solo lectura
- Muestra evidencias en modo solo lectura
- Cierra con tecla ESC
- Previene scroll del body cuando está abierto

## Flujos de Uso

### Ver Detalle de Orden
1. Usuario hace click en "Ver" en la lista de órdenes
2. Se navega a la vista de detalle
3. Se cargan todos los datos de la orden
4. Se muestra la línea de tiempo con estados

### Ver Estado Previo
1. Usuario hace click en un estado completado (✓)
2. Se abre modal con detalles del estado
3. Se muestran comentarios y evidencias de ese estado
4. Usuario cierra el modal

### Agregar Comentario al Estado Actual
1. Usuario escribe comentario en el estado actual
2. Usuario hace click en "Enviar"
3. Se crea el comentario asociado al historial
4. Se refrescan los datos automáticamente

### Subir Evidencia al Estado Actual
1. Usuario selecciona o arrastra un archivo
2. Se muestra preview (si es imagen)
3. Usuario opcionalmente agrega comentario
4. Usuario hace click en "Subir Evidencia"
5. Se crea la evidencia asociada al estado
6. Se refrescan los datos automáticamente

### Avanzar al Siguiente Estado
1. Usuario hace click en "Avanzar →" en el siguiente estado futuro
2. Se muestra confirmación
3. Se actualiza el estado de la orden
4. Se crea registro en historial_estados_orden
5. Se recargan todos los datos
6. La línea de tiempo se actualiza automáticamente

## Estilos

Todos los estilos están en `OrdenDetail.css` con:
- Variables CSS para colores de estados
- Animación pulse para estado actual
- Hover effects para estados completados
- Responsive design para móviles
- Drag & drop visual feedback

## Integración con Backend

### Endpoints Utilizados

```javascript
// Orden
GET    /api/ordenes/:id
PUT    /api/ordenes/:id/estado

// Flujo
GET    /api/flujos/:id/estados

// Historial
GET    /api/historial/orden/:idOrden

// Comentarios
POST   /api/comentarios

// Evidencias
GET    /api/evidencias/orden/:idOrden
POST   /api/evidencias
```

### Estructura de Datos

#### Orden
```javascript
{
  id_orden, id_cliente, id_producto, id_flujo, id_estado_actual,
  descripcion_servicio, condiciones_pago, fecha_creacion,
  fecha_estimada_entrega, notas_orden,
  cliente: { nombre_completo, telefono_contacto, correo_electronico },
  producto: { nombre_producto, modelo, numero_serie },
  flujo: { nombre_flujo, descripcion_flujo },
  estado_actual: { nombre_estado }
}
```

#### Historial
```javascript
[{
  id_historial, id_orden, id_estado, id_usuario_responsable,
  fecha_hora_cambio,
  estados: { nombre_estado },
  usuarios: { nombre },
  comentarios_estado: [{ id_comentario, texto_comentario, fecha_hora_comentario }]
}]
```

#### Evidencias
```javascript
[{
  id_evidencia, id_orden, id_estado, tipo_evidencia,
  s3_key, nombre_archivo_original, comentario, fecha_subida,
  estados: { nombre_estado },
  usuarios: { nombre }
}]
```

## Notas Importantes

### Sobre historial_estados_orden
- Cada registro representa un momento cuando la orden cambió de estado
- Los comentarios están ligados al historial (id_historial)
- Las evidencias están ligadas al estado (id_estado)
- Estados futuros NO tienen historial hasta que se avanza a ellos

### Sobre Transiciones de Estado
- Solo se puede avanzar al siguiente estado secuencial
- No se pueden saltar estados
- Al avanzar se crea automáticamente un registro en historial
- El estado anterior pasa a ser "completado"

### TODOs Pendientes
- [ ] Implementar autenticación de usuario (actualmente usa id_usuario: 1)
- [ ] Implementar subida real a S3 (actualmente usa s3_key simulado)
- [ ] Agregar edición de comentarios
- [ ] Agregar eliminación de evidencias desde la vista
- [ ] Implementar lightbox para ver imágenes en grande
- [ ] Agregar filtros en el panel de evidencias

## Uso

```jsx
// En App.jsx
import OrdenDetail from './pages/OrdenDetail';

<OrdenDetail 
  ordenId={123} 
  onVolver={() => setActiveView('ordenes')} 
/>
```

## Criterios de Éxito

Usuario puede navegar a detalle de orden  
Se muestra información completa de la orden  
Línea de tiempo refleja estados correctamente  
Usuario puede agregar comentarios al estado actual  
Usuario puede subir evidencias al estado actual  
Usuario puede ver comentarios/evidencias de estados previos  
Usuario puede avanzar al siguiente estado  
Sistema valida transiciones de estado  
Datos se actualizan automáticamente
