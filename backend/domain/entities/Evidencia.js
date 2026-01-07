const BaseEntity = require('./BaseEntity');

class Evidencia extends BaseEntity {
    constructor(data) {
        super();
        this.id_evidencia = data.id_evidencia;
        this.id_orden = data.id_orden;
        this.id_estado = data.id_estado;
        this.id_usuario = data.id_usuario;
        this.tipo_evidencia = data.tipo_evidencia;
        this.s3_key = data.s3_key;
        this.nombre_archivo_original = data.nombre_archivo_original || null;
        this.comentario = data.comentario || null;
        this.public = data.public ?? data.Public ?? false;
        this.fecha_subida = data.fecha_subida || new Date();
    }

    // Validaciones de negocio
    validate() {
        const errors = [];

        if (!this.id_orden) {
            errors.push('El ID de la orden es requerido');
        }

        if (!this.id_estado) {
            errors.push('El ID del estado es requerido');
        }

        if (!this.id_usuario) {
            errors.push('El ID del usuario es requerido');
        }

        if (!this.tipo_evidencia || this.tipo_evidencia.trim() === '') {
            errors.push('El tipo de evidencia es requerido');
        }

        const tiposValidos = ['image', 'pdf', 'video', 'document', 'other'];
        if (this.tipo_evidencia && !tiposValidos.includes(this.tipo_evidencia)) {
            errors.push(`El tipo de evidencia debe ser uno de: ${tiposValidos.join(', ')}`);
        }

        if (!this.s3_key || this.s3_key.trim() === '') {
            errors.push('La clave S3 es requerida');
        }

        if (this.s3_key && this.s3_key.length > 255) {
            errors.push('La clave S3 no puede exceder 255 caracteres');
        }

        return errors;
    }

    // Método para obtener datos serializables
    toJSON() {
        return {
            id_evidencia: this.id_evidencia,
            id_orden: this.id_orden,
            id_estado: this.id_estado,
            id_usuario: this.id_usuario,
            tipo_evidencia: this.tipo_evidencia,
            s3_key: this.s3_key,
            nombre_archivo_original: this.nombre_archivo_original,
            comentario: this.comentario,
            public: this.public,
            fecha_subida: this.fecha_subida
        };
    }
}

module.exports = Evidencia;
