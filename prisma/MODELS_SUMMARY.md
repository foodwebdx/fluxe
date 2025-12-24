# Resumen de Modelos Prisma - Base de Datos Neon

**Fecha de sincronización:** 2025-12-24  
**Total de modelos detectados:** 12  
**Base de datos:** PostgreSQL (Neon)

---

## 📊 Modelos Detectados

### 1. **clientes** (Clientes)
- **ID:** `id_cliente` (autoincrement)
- **Campos principales:**
  - Identificación: `tipo_identificacion`, `numero_identificacion`
  - Contacto: `nombre_completo`, `telefono_contacto`, `correo_electronico`
  - Dirección: `tipo_direccion`, `direccion`
  - Notas: `notas_cliente`
- **Relaciones:**
  - ➡️ `ordenes[]` - Un cliente puede tener múltiples órdenes
  - ➡️ `productos[]` - Un cliente puede tener múltiples productos
- **Constraints:**
  - Email único
  - Combinación única de tipo y número de identificación

---

### 2. **productos** (Productos)
- **ID:** `id_producto` (autoincrement)
- **Campos principales:**
  - `nombre_producto`, `descripcion`
  - `identificador_interno`, `modelo`, `numero_serie`
  - `identificador_unico_adicional`
  - `notas_producto`
- **Relaciones:**
  - ⬅️ `clientes` - Pertenece a un cliente (FK: `id_cliente`)
  - ➡️ `ordenes[]` - Un producto puede estar en múltiples órdenes

---

### 3. **ordenes** (Órdenes de Servicio)
- **ID:** `id_orden` (autoincrement)
- **Campos principales:**
  - `descripcion_servicio`, `condiciones_pago`
  - `fecha_creacion`, `fecha_estimada_entrega`, `fecha_cierre`
  - `notas_orden`
- **Relaciones:**
  - ⬅️ `clientes` - Pertenece a un cliente (FK: `id_cliente`)
  - ⬅️ `productos` - Asociada a un producto (FK: `id_producto`)
  - ⬅️ `flujos` - Sigue un flujo específico (FK: `id_flujo`)
  - ⬅️ `estados` - Tiene un estado actual (FK: `id_estado_actual`)
  - ➡️ `evidencias[]` - Puede tener múltiples evidencias
  - ➡️ `historial_estados_orden[]` - Historial de cambios de estado

---

### 4. **flujos** (Flujos de Trabajo)
- **ID:** `id_flujo` (autoincrement)
- **Campos principales:**
  - `nombre_flujo` (único)
  - `descripcion_flujo`
  - `activo` (boolean, default: true)
- **Relaciones:**
  - ➡️ `flujos_estados[]` - Estados que componen el flujo
  - ➡️ `ordenes[]` - Órdenes que usan este flujo

---

### 5. **estados** (Estados del Flujo)
- **ID:** `id_estado` (autoincrement)
- **Campos principales:**
  - `nombre_estado` (único)
  - `descripcion_estado`
- **Relaciones:**
  - ➡️ `flujos_estados[]` - Parte de múltiples flujos
  - ➡️ `ordenes[]` - Órdenes en este estado
  - ➡️ `evidencias[]` - Evidencias asociadas al estado
  - ➡️ `historial_estados_orden[]` - Historial de cambios

---

### 6. **flujos_estados** (Relación Flujos-Estados)
- **Composite PK:** `[id_flujo, posicion]`
- **Campos principales:**
  - `posicion` - Orden del estado en el flujo
  - `obligatorio` (boolean, default: true)
- **Relaciones:**
  - ⬅️ `flujos` - Pertenece a un flujo (FK: `id_flujo`)
  - ⬅️ `estados` - Referencia un estado (FK: `id_estado`)

---

### 7. **historial_estados_orden** (Historial de Cambios)
- **ID:** `id_historial` (autoincrement)
- **Campos principales:**
  - `fecha_hora_cambio` (timestamp, default: now)
- **Relaciones:**
  - ⬅️ `ordenes` - Pertenece a una orden (FK: `id_orden`)
  - ⬅️ `estados` - Estado al que cambió (FK: `id_estado`)
  - ⬅️ `usuarios` - Usuario responsable (FK: `id_usuario_responsable`)
  - ➡️ `comentarios_estado[]` - Comentarios del cambio

---

### 8. **comentarios_estado** (Comentarios en Cambios)
- **ID:** `id_comentario` (autoincrement)
- **Campos principales:**
  - `texto_comentario`
  - `fecha_hora_comentario` (timestamp, default: now)
- **Relaciones:**
  - ⬅️ `historial_estados_orden` - Pertenece a un historial (FK: `id_historial`)
  - ⬅️ `usuarios` - Creado por usuario (FK: `id_usuario`)

---

### 9. **evidencias** (Archivos/Evidencias)
- **ID:** `id_evidencia` (autoincrement)
- **Campos principales:**
  - `tipo_evidencia` - Tipo de archivo
  - `s3_key` - Llave en S3
  - `nombre_archivo_original`
  - `comentario`
  - `fecha_subida` (timestamp, default: now)
- **Relaciones:**
  - ⬅️ `ordenes` - Pertenece a una orden (FK: `id_orden`)
  - ⬅️ `estados` - Asociada a un estado (FK: `id_estado`)
  - ⬅️ `usuarios` - Subida por usuario (FK: `id_usuario`)

---

### 10. **usuarios** (Usuarios del Sistema)
- **ID:** `id_usuario` (autoincrement)
- **Campos principales:**
  - `nombre`, `email` (único), `telefono`
  - `usuario_login`, `hash_password`
- **Relaciones:**
  - ➡️ `usuarios_roles[]` - Roles asignados
  - ➡️ `comentarios_estado[]` - Comentarios creados
  - ➡️ `evidencias[]` - Evidencias subidas
  - ➡️ `historial_estados_orden[]` - Cambios de estado realizados

---

### 11. **roles** (Roles de Usuario)
- **ID:** `id_rol` (autoincrement)
- **Campos principales:**
  - `nombre_rol` (único)
  - `descripcion_rol`
- **Relaciones:**
  - ➡️ `usuarios_roles[]` - Usuarios con este rol

---

### 12. **usuarios_roles** (Relación Usuarios-Roles)
- **Composite PK:** `[id_usuario, id_rol]`
- **Relaciones:**
  - ⬅️ `usuarios` - Pertenece a un usuario (FK: `id_usuario`)
  - ⬅️ `roles` - Referencia un rol (FK: `id_rol`)

---

## 🔗 Diagrama de Relaciones Principales

```
clientes
  ├── productos (1:N)
  └── ordenes (1:N)
       ├── productos (N:1)
       ├── flujos (N:1)
       ├── estados (N:1 - estado actual)
       ├── evidencias (1:N)
       └── historial_estados_orden (1:N)
            ├── estados (N:1)
            ├── usuarios (N:1)
            └── comentarios_estado (1:N)
                 └── usuarios (N:1)

flujos
  └── flujos_estados (1:N)
       └── estados (N:1)

usuarios
  └── usuarios_roles (1:N)
       └── roles (N:1)
```

---

## 📝 Notas Importantes

1. **Cascade Deletes:**
   - Eliminar cliente → elimina sus productos
   - Eliminar orden → elimina evidencias e historial
   - Eliminar flujo → elimina flujos_estados
   - Eliminar usuario/rol → elimina usuarios_roles

2. **Campos con Default:**
   - Fechas: `now()` en creación y cambios
   - Booleanos: `activo` en flujos, `obligatorio` en flujos_estados

3. **Constraints Únicos:**
   - Email en clientes y usuarios
   - Nombres en estados, flujos y roles
   - Combinación tipo+número identificación en clientes

4. **Campos Opcionales (nullable):**
   - Direcciones en clientes
   - Descripciones en varios modelos
   - Fechas de cierre y entrega en órdenes
   - Campos de autenticación en usuarios

---

## 🚀 Próximos Pasos

1. ✅ Schema sincronizado desde Neon
2. ✅ Cliente Prisma generado
3. ⏳ Crear repositorios para nuevos modelos
4. ⏳ Crear entidades de dominio
5. ⏳ Implementar casos de uso
6. ⏳ Crear controladores y rutas

---

## 📚 Modelos Disponibles en Código

Ahora puedes usar en tus repositorios:

```javascript
const prisma = getPrisma();

// Todos estos modelos están disponibles:
await prisma.clientes.findMany();
await prisma.productos.findMany();
await prisma.ordenes.findMany();
await prisma.flujos.findMany();
await prisma.estados.findMany();
await prisma.flujos_estados.findMany();
await prisma.historial_estados_orden.findMany();
await prisma.comentarios_estado.findMany();
await prisma.evidencias.findMany();
await prisma.usuarios.findMany();
await prisma.roles.findMany();
await prisma.usuarios_roles.findMany();
```

Con todas sus relaciones incluidas mediante `include`:

```javascript
await prisma.ordenes.findMany({
  include: {
    clientes: true,
    productos: true,
    flujos: true,
    estados: true,
    evidencias: true,
    historial_estados_orden: {
      include: {
        usuarios: true,
        comentarios_estado: true
      }
    }
  }
});
```
