# 📦 Implementación de AWS S3 para Evidencias

## ✅ Estado: COMPLETADO

---

## 📋 Resumen

Se ha implementado exitosamente la integración con AWS S3 para almacenar archivos reales de evidencias (imágenes, PDFs, documentos) en lugar de solo guardar metadata en la base de datos.

---

## 🔧 Configuración AWS

### Bucket S3
- **Nombre**: `fluxe-evidencias-dev`
- **Región**: `us-east-2`
- **Encriptación**: SSE-S3 (AES256)
- **Acceso público**: Bloqueado ✅

### Usuario IAM
- **Usuario**: `fluxe-s3-service`
- **Access Key ID**: `AKIAUTJ66QTYLCIYQMB3`
- **Permisos**: PutObject, GetObject, DeleteObject, ListBucket

### CORS Configurado
```json
[{
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["http://localhost:5173", "http://localhost:3000"],
    "ExposeHeaders": ["ETag", "x-amz-server-side-encryption"],
    "MaxAgeSeconds": 3000
}]
```

---

## 📦 Dependencias Instaladas

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer
```

- **@aws-sdk/client-s3**: Cliente oficial de AWS para S3
- **@aws-sdk/s3-request-presigner**: Generación de URLs firmadas
- **multer**: Middleware para manejar archivos multipart/form-data

---

## 🗂️ Archivos Creados/Modificados

### Backend - Nuevos Archivos

1. **`backend/infrastructure/services/S3Service.js`**
   - Servicio para interactuar con AWS S3
   - Métodos: `uploadFile()`, `deleteFile()`, `getSignedUrl()`, `fileExists()`

2. **`backend/presentation/middlewares/upload.js`**
   - Middleware Multer para procesar archivos
   - Validación de tipos: imágenes, PDF, Word
   - Límite: 10MB por archivo

### Backend - Archivos Modificados

3. **`.env`**
   - Variables de entorno AWS agregadas

4. **`.env.example`**
   - Template actualizado con variables AWS

5. **`backend/application/usecases/evidencia/CreateEvidenciaUseCase.js`**
   - Ahora sube archivos reales a S3
   - Genera s3_key único
   - Retorna URL firmada

6. **`backend/application/usecases/evidencia/DeleteEvidenciaUseCase.js`**
   - Elimina archivo de S3 antes de borrar de BD

7. **`backend/application/usecases/evidencia/GetEvidenciasUseCase.js`**
   - Genera URLs firmadas para cada evidencia

8. **`backend/application/usecases/evidencia/GetEvidenciasByOrdenUseCase.js`**
   - Genera URLs firmadas para evidencias de una orden

9. **`backend/presentation/controllers/EvidenciaController.js`**
   - Maneja `req.file` de Multer
   - Parsea datos de FormData

10. **`backend/presentation/routes/evidencia.routes.js`**
    - Agregado middleware `upload.single('file')` en POST

### Frontend - Archivos Modificados

11. **`Frontend/src/components/orden/EvidenciasSection.jsx`**
    - Usa FormData para enviar archivos
    - Muestra imágenes usando URLs firmadas de S3
    - Enlaces de descarga para PDFs/documentos

---

## 🔄 Flujo de Funcionamiento

### 1. Subir Evidencia
```
Usuario selecciona archivo
    ↓
Frontend crea FormData con archivo real
    ↓
POST /api/evidencias con multipart/form-data
    ↓
Multer procesa archivo en memoria (req.file)
    ↓
S3Service sube archivo a S3
    ↓
Se guarda metadata en BD (s3_key, tipo, nombre)
    ↓
Se genera URL firmada (válida 1 hora)
    ↓
Frontend recibe URL y refresca lista
```

### 2. Visualizar Evidencias
```
GET /api/evidencias/orden/:id
    ↓
Se obtienen evidencias de BD
    ↓
Para cada evidencia se genera URL firmada
    ↓
Frontend muestra imágenes o enlaces de descarga
```

### 3. Eliminar Evidencia
```
DELETE /api/evidencias/:id
    ↓
Se obtiene evidencia de BD
    ↓
S3Service elimina archivo de S3
    ↓
Se elimina registro de BD
    ↓
Frontend refresca lista
```

---

## 🔐 Seguridad

### URLs Firmadas
- **Duración**: 1 hora (3600 segundos)
- **Beneficio**: Acceso temporal sin exponer credenciales
- **Renovación**: Automática al recargar evidencias

### Validaciones
- **Tipos permitidos**: JPEG, PNG, GIF, WebP, PDF, DOC, DOCX
- **Tamaño máximo**: 10MB
- **Nombres sanitizados**: Caracteres especiales reemplazados

### Encriptación
- **En tránsito**: HTTPS
- **En reposo**: SSE-S3 (AES256)

---

## 📊 Estructura de Archivos en S3

```
fluxe-evidencias-dev/
└── evidencias/
    ├── {id_orden}/
    │   ├── {timestamp}_{nombre_archivo}.jpg
    │   ├── {timestamp}_{nombre_archivo}.pdf
    │   └── {timestamp}_{nombre_archivo}.docx
    └── {id_orden}/
        └── ...
```

**Ejemplo**:
```
evidencias/123/1704403200000_foto_producto.jpg
evidencias/123/1704403300000_factura.pdf
evidencias/456/1704403400000_reporte.docx
```

---

## 🧪 Pruebas Recomendadas

### 1. Subir Imagen
- [ ] Subir imagen JPG/PNG
- [ ] Verificar que aparece en S3 Console
- [ ] Verificar que se muestra en frontend

### 2. Subir PDF
- [ ] Subir archivo PDF
- [ ] Verificar enlace de descarga
- [ ] Descargar y abrir PDF

### 3. Eliminar Evidencia
- [ ] Eliminar evidencia
- [ ] Verificar que se elimina de S3
- [ ] Verificar que desaparece de frontend

### 4. Validaciones
- [ ] Intentar subir archivo > 10MB (debe fallar)
- [ ] Intentar subir tipo no permitido (debe fallar)

---

## 🚀 Comandos para Probar

### Iniciar Backend
```bash
cd /Users/santiagofernandez/Desktop/Qversity/fluxe
npm start
```

### Iniciar Frontend
```bash
cd /Users/santiagofernandez/Desktop/Qversity/fluxe/Frontend
npm run dev
```

### Verificar Variables de Entorno
```bash
cat .env | grep AWS
```

---

## 📝 Variables de Entorno

```env
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=AKIAUTJ66QTYLCIYQMB3
AWS_SECRET_ACCESS_KEY=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
AWS_S3_BUCKET_NAME=fluxe-evidencias-dev
```

---

## 🎯 Ventajas de la Implementación

✅ **Archivos reales guardados** en S3 (no solo metadata)  
✅ **URLs firmadas temporales** (seguridad mejorada)  
✅ **Eliminación automática** de S3 al borrar evidencia  
✅ **Validación de tipos** de archivo  
✅ **Límite de tamaño** (10MB)  
✅ **Encriptación** en reposo (SSE-S3)  
✅ **Arquitectura limpia** mantenida  
✅ **Escalable** para producción  
✅ **Compatible** con CDN (CloudFront)  

---

## 🔮 Mejoras Futuras

- [ ] Implementar CloudFront CDN para mejor rendimiento
- [ ] Agregar compresión de imágenes antes de subir
- [ ] Implementar versionado de archivos
- [ ] Agregar thumbnails para imágenes
- [ ] Implementar política de lifecycle (eliminar archivos antiguos)
- [ ] Agregar métricas de uso de S3
- [ ] Implementar backup automático

---

## 📚 Documentación de Referencia

- [AWS S3 SDK v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/)
- [Multer Documentation](https://github.com/expressjs/multer)
- [S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html)

---

**Fecha de Implementación**: 2026-01-04  
**Implementado por**: Roo (Code Mode)  
**Estado**: ✅ Listo para pruebas
