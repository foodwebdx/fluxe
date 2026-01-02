# Estilos CSS y Checklist - Vista Detallada de Orden

**Complemento de:** ORDEN-DETAIL-VIEW-PLAN.md  
**Fecha:** 2026-01-02

---

## 🎨 Estilos CSS Completos

### Paleta de Colores para Estados

```css
/* Estados */
.timeline-estado.completed {
  --estado-color: #48bb78; /* Verde */
  --estado-bg: #f0fff4;
  --estado-border: #9ae6b4;
}

.timeline-estado.current {
  --estado-color: #667eea; /* Morado */
  --estado-bg: #f0f4ff;
  --estado-border: #a5b4fc;
}

.timeline-estado.pending {
  --estado-color: #cbd5e0; /* Gris */
  --estado-bg: #f7fafc;
  --estado-border: #e2e8f0;
}
```

### Estructura CSS Principal

```css
/* OrdenDetail.css */

/* Contenedor principal */
.orden-detail-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header con botón de regreso */
.orden-detail-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

/* Grid de información */
.orden-detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

/* Tarjeta de información */
.orden-info-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.info-section {
  margin-bottom: 1.5rem;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.info-value {
  font-size: 1rem;
  color: #1e293b;
  font-weight: 500;
}

/* Línea de tiempo */
.timeline-container {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.timeline-header {
  margin-bottom: 2rem;
}

.timeline-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  overflow-x: auto;
  padding: 1rem 0;
}

/* Estado individual en timeline */
.timeline-estado {
  min-width: 180px;
  text-align: center;
  position: relative;
}

.timeline-estado::after {
  content: '';
  position: absolute;
  top: 30px;
  right: -1rem;
  width: 1rem;
  height: 2px;
  background: #e2e8f0;
}

.timeline-estado:last-child::after {
  display: none;
}

.estado-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 0.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: var(--estado-bg);
  border: 3px solid var(--estado-border);
  color: var(--estado-color);
  transition: all 0.3s;
}

.timeline-estado.completed .estado-icon {
  cursor: pointer;
}

.timeline-estado.completed .estado-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
}

.timeline-estado.current .estado-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
  }
}

.estado-nombre {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.estado-fecha {
  font-size: 0.875rem;
  color: #64748b;
}

/* Contenido del estado actual */
.estado-content {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 2px solid var(--estado-border);
}

/* Sección de comentarios */
.comentarios-section {
  margin-bottom: 1.5rem;
}

.comentarios-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.comentarios-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.comentario-item {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border-left: 3px solid #667eea;
}

.comentario-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.comentario-usuario {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.875rem;
}

.comentario-fecha {
  font-size: 0.75rem;
  color: #64748b;
}

.comentario-texto {
  color: #475569;
  line-height: 1.5;
}

.comentario-form {
  display: flex;
  gap: 0.5rem;
}

.comentario-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
}

.comentario-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Sección de evidencias */
.evidencias-section {
  margin-bottom: 1.5rem;
}

.evidencias-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.evidencia-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
}

.evidencia-item:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.evidencia-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.evidencia-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  font-size: 3rem;
}

.evidencia-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  padding: 0.5rem;
  color: white;
  font-size: 0.75rem;
}

.upload-zone {
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-zone:hover {
  border-color: #667eea;
  background: #f0f4ff;
}

.upload-zone.dragover {
  border-color: #667eea;
  background: #f0f4ff;
}

/* Panel de todas las evidencias */
.all-evidencias-panel {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.evidencias-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.evidencias-by-estado {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.estado-evidencias-group {
  border-left: 3px solid #667eea;
  padding-left: 1rem;
}

.estado-evidencias-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

/* Modal de estado */
.estado-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.estado-modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.estado-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #1e293b;
}

/* Botones */
.btn-primary {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #5568d3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #f7fafc;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger:hover {
  background: #dc2626;
}

/* Responsive */
@media (max-width: 768px) {
  .timeline-wrapper {
    flex-direction: column;
    align-items: stretch;
  }
  
  .timeline-estado::after {
    display: none;
  }
  
  .evidencias-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
```

---

## ✅ Checklist de Implementación Detallado

### Fase 1: Setup y Routing (1-2 horas)

- [ ] **Decisión de Routing**
  - [ ] Evaluar pros/contras de React Router vs estado local
  - [ ] Documentar decisión tomada
  
- [ ] **Si se usa React Router:**
  - [ ] Instalar: `npm install react-router-dom`
  - [ ] Modificar `App.jsx` para usar `<BrowserRouter>` y `<Routes>`
  - [ ] Modificar `Sidebar.jsx` para usar `<Link>` o `useNavigate`
  - [ ] Configurar rutas: `/`, `/dashboard`, `/ordenes`, `/ordenes/:id`, etc.
  
- [ ] **Si NO se usa React Router:**
  - [ ] Modificar `App.jsx` para manejar `selectedOrdenId` en estado
  - [ ] Crear funciones `handleVerOrden` y `handleVolverOrdenes`
  - [ ] Pasar callbacks a componente `Ordenes`
  
- [ ] **Estructura de Archivos**
  - [ ] Crear directorio `Frontend/src/components/orden/`
  - [ ] Crear archivo `Frontend/src/components/orden/OrdenDetail.css`

### Fase 2: Componentes Base (3-4 horas)

#### OrdenDetail.jsx

- [ ] **Estructura Básica**
  - [ ] Crear componente funcional
  - [ ] Importar hooks necesarios (`useState`, `useEffect`)
  - [ ] Importar `useParams` si se usa React Router
  
- [ ] **Estados Locales**
  - [ ] `const [orden, setOrden] = useState(null)`
  - [ ] `const [estadosFlujo, setEstadosFlujo] = useState([])`
  - [ ] `const [historial, setHistorial] = useState([])`
  - [ ] `const [evidencias, setEvidencias] = useState([])`
  - [ ] `const [loading, setLoading] = useState(true)`
  - [ ] `const [error, setError] = useState(null)`
  
- [ ] **Funciones de Carga**
  - [ ] `fetchOrden(ordenId)` - GET `/api/ordenes/:id`
  - [ ] `fetchEstadosFlujo(flujoId)` - GET `/api/flujos/:id/estados`
  - [ ] `fetchHistorial(ordenId)` - GET `/api/historial/orden/:idOrden`
  - [ ] `fetchEvidencias(ordenId)` - GET `/api/evidencias/orden/:idOrden`
  - [ ] `loadAllData()` - Función que llama a todas las anteriores
  
- [ ] **useEffect**
  - [ ] Llamar `loadAllData()` al montar componente
  - [ ] Manejar cleanup si es necesario
  
- [ ] **Navegación**
  - [ ] Implementar botón de regreso
  - [ ] Función `handleVolver()` para navegar a lista de órdenes
  
- [ ] **Renderizado**
  - [ ] Mostrar loading state
  - [ ] Mostrar error state
  - [ ] Renderizar componentes hijos cuando datos estén listos

#### OrdenInfoCard.jsx

- [ ] **Props**
  - [ ] Definir PropTypes o TypeScript types
  - [ ] Validar props requeridas
  
- [ ] **Secciones de Información**
  - [ ] Sección de Cliente (nombre, teléfono, email)
  - [ ] Sección de Producto (nombre, modelo, serie)
  - [ ] Sección de Orden (descripción, condiciones, fechas)
  - [ ] Sección de Flujo (nombre, descripción)
  
- [ ] **Formateo de Datos**
  - [ ] Función para formatear fechas
  - [ ] Función para formatear teléfonos (opcional)
  - [ ] Manejo de valores null/undefined
  
- [ ] **Estilos**
  - [ ] Aplicar clases CSS
  - [ ] Responsive design

### Fase 3: Línea de Tiempo (4-5 horas)

#### EstadosTimeline.jsx

- [ ] **Props**
  - [ ] `estadosFlujo: Array`
  - [ ] `historial: Array`
  - [ ] `estadoActualId: Number`
  - [ ] `ordenId: Number`
  - [ ] `onEstadoChange: Function`
  - [ ] `onRefresh: Function`
  
- [ ] **Lógica de Clasificación**
  - [ ] Función `clasificarEstados()`
  - [ ] Identificar estados previos (posición < actual)
  - [ ] Identificar estado actual
  - [ ] Identificar estados futuros (posición > actual)
  - [ ] Asociar historial a cada estado previo/actual
  
- [ ] **Estado Local**
  - [ ] `const [selectedEstado, setSelectedEstado] = useState(null)`
  - [ ] `const [showModal, setShowModal] = useState(false)`
  
- [ ] **Handlers**
  - [ ] `handleVerEstado(estado)` - Abrir modal de estado previo
  - [ ] `handleAvanzarEstado(estado)` - Avanzar al siguiente estado
  - [ ] `handleCloseModal()` - Cerrar modal
  
- [ ] **Renderizado**
  - [ ] Contenedor con scroll horizontal
  - [ ] Mapear estados previos
  - [ ] Renderizar estado actual
  - [ ] Mapear estados futuros
  - [ ] Renderizar modal si está abierto

#### TimelineEstado.jsx

- [ ] **Props**
  - [ ] `estado: Object`
  - [ ] `type: 'completed' | 'current' | 'pending'`
  - [ ] `ordenId: Number` (solo para current)
  - [ ] `onClick: Function` (solo para completed)
  - [ ] `onAvanzar: Function` (solo para pending)
  - [ ] `onRefresh: Function` (solo para current)
  
- [ ] **Renderizado Condicional**
  - [ ] **Estado Completado:**
    - [ ] Icono de check (✓)
    - [ ] Nombre del estado
    - [ ] Fecha del cambio
    - [ ] Click handler
  - [ ] **Estado Actual:**
    - [ ] Icono destacado (●)
    - [ ] Nombre del estado
    - [ ] Fecha del cambio
    - [ ] Sección de comentarios
    - [ ] Sección de evidencias
  - [ ] **Estado Pendiente:**
    - [ ] Icono vacío (○)
    - [ ] Nombre del estado
    - [ ] Sin fecha
    - [ ] Botón "Avanzar" si es el siguiente
  
- [ ] **Estilos**
  - [ ] Aplicar clases según tipo
  - [ ] Animación para estado actual
  - [ ] Hover effects para completados

### Fase 4: Gestión de Comentarios (2-3 horas)

#### ComentariosSection.jsx

- [ ] **Props**
  - [ ] `historialId: Number`
  - [ ] `comentarios: Array`
  - [ ] `onRefresh: Function`
  - [ ] `readOnly: Boolean`
  
- [ ] **Estado Local**
  - [ ] `const [nuevoComentario, setNuevoComentario] = useState('')`
  - [ ] `const [submitting, setSubmitting] = useState(false)`
  - [ ] `const [editingId, setEditingId] = useState(null)` (opcional)
  
- [ ] **Funciones**
  - [ ] `handleAgregarComentario()` - POST `/api/comentarios`
  - [ ] `handleEditarComentario(id)` - PUT `/api/comentarios/:id` (opcional)
  - [ ] `handleEliminarComentario(id)` - DELETE `/api/comentarios/:id` (opcional)
  
- [ ] **Validaciones**
  - [ ] Comentario no vacío
  - [ ] Longitud mínima/máxima
  - [ ] Sanitización de input
  
- [ ] **Renderizado**
  - [ ] Lista de comentarios existentes
  - [ ] Formulario de nuevo comentario (si no readOnly)
  - [ ] Botones de acción (editar/eliminar) (opcional)
  - [ ] Loading states
  - [ ] Error messages

### Fase 5: Gestión de Evidencias (3-4 horas)

#### EvidenciasSection.jsx

- [ ] **Props**
  - [ ] `ordenId: Number`
  - [ ] `estadoId: Number`
  - [ ] `evidencias: Array`
  - [ ] `onRefresh: Function`
  - [ ] `readOnly: Boolean`
  
- [ ] **Estado Local**
  - [ ] `const [selectedFile, setSelectedFile] = useState(null)`
  - [ ] `const [preview, setPreview] = useState(null)`
  - [ ] `const [comentario, setComentario] = useState('')`
  - [ ] `const [uploading, setUploading] = useState(false)`
  - [ ] `const [dragOver, setDragOver] = useState(false)`
  
- [ ] **Funciones**
  - [ ] `handleFileSelect(e)` - Seleccionar archivo
  - [ ] `handleDrop(e)` - Drag & drop
  - [ ] `handleDragOver(e)` - Drag over
  - [ ] `handleDragLeave(e)` - Drag leave
  - [ ] `createPreview(file)` - Crear preview de imagen
  - [ ] `handleUpload()` - POST `/api/evidencias`
  - [ ] `handleDelete(id)` - DELETE `/api/evidencias/:id`
  - [ ] `getFileIcon(type)` - Icono según tipo de archivo
  
- [ ] **Validaciones**
  - [ ] Tipo de archivo permitido
  - [ ] Tamaño máximo de archivo
  - [ ] Formato de imagen válido
  
- [ ] **Renderizado**
  - [ ] Grid de evidencias existentes
  - [ ] Preview de imágenes
  - [ ] Iconos para documentos
  - [ ] Zona de drag & drop (si no readOnly)
  - [ ] Formulario de upload (si no readOnly)
  - [ ] Loading states
  - [ ] Error messages

### Fase 6: Modal de Estado Previo (2 horas)

#### EstadoModal.jsx

- [ ] **Props**
  - [ ] `estado: Object`
  - [ ] `evidencias: Array`
  - [ ] `onClose: Function`
  
- [ ] **Estructura**
  - [ ] Overlay con click para cerrar
  - [ ] Contenido del modal
  - [ ] Header con título y botón cerrar
  - [ ] Información del estado
  - [ ] Sección de comentarios (readOnly)
  - [ ] Sección de evidencias (readOnly)
  
- [ ] **Funcionalidad**
  - [ ] Filtrar evidencias por estado
  - [ ] Cerrar con ESC key
  - [ ] Prevenir scroll del body cuando está abierto
  - [ ] Animación de entrada/salida
  
- [ ] **Estilos**
  - [ ] Overlay semi-transparente
  - [ ] Modal centrado
  - [ ] Scroll interno si es necesario
  - [ ] Responsive

### Fase 7: Panel de Todas las Evidencias (2-3 horas)

#### AllEvidenciasPanel.jsx

- [ ] **Props**
  - [ ] `evidencias: Array`
  - [ ] `estadosFlujo: Array`
  
- [ ] **Estado Local**
  - [ ] `const [filtroTipo, setFiltroTipo] = useState('all')`
  - [ ] `const [busqueda, setBusqueda] = useState('')`
  - [ ] `const [vistaGaleria, setVistaGaleria] = useState(true)`
  
- [ ] **Funciones**
  - [ ] `agruparPorEstado()` - Agrupar evidencias
  - [ ] `filtrarEvidencias()` - Aplicar filtros
  - [ ] `handleDownload(evidencia)` - Descargar archivo
  
- [ ] **Renderizado**
  - [ ] Filtros (tipo, búsqueda)
  - [ ] Toggle vista galería/lista
  - [ ] Evidencias agrupadas por estado
  - [ ] Contador de evidencias por estado
  - [ ] Vista de galería para imágenes
  - [ ] Vista de lista para documentos

### Fase 8: Integración y Flujos (2-3 horas)

#### Modificar Ordenes.jsx

- [ ] **Cambiar Botón "Ver"**
  - [ ] Remover `handleViewOrden`
  - [ ] Implementar navegación (Router o callback)
  - [ ] Mantener botones "Editar" y "Eliminar"
  
- [ ] **Limpiar Código**
  - [ ] Remover modal de visualización
  - [ ] Remover estados relacionados con vista
  - [ ] Mantener modales de crear/editar

#### Implementar Avance de Estado

- [ ] **En EstadosTimeline.jsx**
  - [ ] Función `handleAvanzarEstado(estado)`
  - [ ] Validar que es el siguiente estado secuencial
  - [ ] Mostrar confirmación
  - [ ] Llamar API PUT `/api/ordenes/:id/estado`
  - [ ] Manejar respuesta exitosa
  - [ ] Manejar errores
  - [ ] Llamar `onEstadoChange()` para refrescar
  
- [ ] **En OrdenDetail.jsx**
  - [ ] Función `handleEstadoChange()`
  - [ ] Recargar todos los datos
  - [ ] Mostrar notificación de éxito
  - [ ] Actualizar UI

#### Implementar Refresh de Datos

- [ ] **Después de Agregar Comentario**
  - [ ] Recargar historial
  - [ ] Actualizar vista de timeline
  
- [ ] **Después de Agregar Evidencia**
  - [ ] Recargar evidencias
  - [ ] Actualizar panel de evidencias
  
- [ ] **Después de Cambiar Estado**
  - [ ] Recargar orden completa
  - [ ] Recargar historial
  - [ ] Recargar evidencias

### Fase 9: Estilos y UX (2-3 horas)

- [ ] **Aplicar CSS**
  - [ ] Importar `OrdenDetail.css` en componentes
  - [ ] Verificar clases aplicadas correctamente
  - [ ] Ajustar colores según paleta
  
- [ ] **Animaciones**
  - [ ] Pulse animation para estado actual
  - [ ] Hover effects para estados completados
  - [ ] Transiciones suaves
  - [ ] Loading spinners
  
- [ ] **Estados de Loading**
  - [ ] Skeleton screens (opcional)
  - [ ] Spinners para operaciones async
  - [ ] Disabled states en botones
  
- [ ] **Mensajes de Error**
  - [ ] Toast notifications (opcional)
  - [ ] Inline error messages
  - [ ] Validación visual de formularios
  
- [ ] **Confirmaciones**
  - [ ] Confirmar antes de avanzar estado
  - [ ] Confirmar antes de eliminar evidencia
  - [ ] Confirmar antes de eliminar comentario
  
- [ ] **Responsive Design**
  - [ ] Probar en móvil (< 768px)
  - [ ] Probar en tablet (768px - 1024px)
  - [ ] Probar en desktop (> 1024px)
  - [ ] Ajustar timeline para móvil
  - [ ] Ajustar grids para diferentes tamaños

### Fase 10: Testing y Refinamiento (2-3 horas)

- [ ] **Testing Funcional**
  - [ ] Navegar a detalle de orden
  - [ ] Verificar carga de datos
  - [ ] Click en estado previo abre modal
  - [ ] Agregar comentario al estado actual
  - [ ] Subir evidencia al estado actual
  - [ ] Avanzar al siguiente estado
  - [ ] Verificar que no se puede saltar estados
  - [ ] Verificar actualización de datos
  - [ ] Botón de regreso funciona
  
- [ ] **Testing de Errores**
  - [ ] Orden no encontrada
  - [ ] Error de red
  - [ ] Archivo demasiado grande
  - [ ] Tipo de archivo no permitido
  - [ ] Comentario vacío
  
- [ ] **Performance**
  - [ ] Verificar no hay memory leaks
  - [ ] Optimizar re-renders con React.memo (si es necesario)
  - [ ] Lazy loading de imágenes (opcional)
  - [ ] Debounce en búsqueda (si aplica)
  
- [ ] **Accesibilidad**
  - [ ] Navegación con teclado
  - [ ] Labels en formularios
  - [ ] Alt text en imágenes
  - [ ] ARIA labels donde sea necesario
  
- [ ] **Documentación**
  - [ ] JSDoc en funciones principales
  - [ ] README con instrucciones de uso
  - [ ] Comentarios en código complejo

---

## 📊 Estimación de Tiempo

| Fase | Horas Estimadas | Prioridad |