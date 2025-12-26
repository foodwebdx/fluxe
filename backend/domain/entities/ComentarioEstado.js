const BaseEntity = require('./BaseEntity');

class ComentarioEstado extends BaseEntity {
    constructor(data) {
        super();
        this.id_comentario = data.id_comentario;
        this.id_historial = data.id_historial;
        this.id_usuario = data.id_usuario;
        this.texto_comentario = data.texto_comentario;
        this.fecha_hora_comentario = data.fecha_hora_comentario || new Date();
    }

    // Validaciones de negocio
    validate() {
        const errors = [];

        if (!this.id_historial) {
            errors.push('El ID del historial es requerido');
        }

        if (!this.id_usuario) {
            errors.push('El ID del usuario es requerido');
        }

        if (!this.texto_comentario || this.texto_comentario.trim() === '') {
            errors.push('El texto del comentario es requerido');
        }

        if (this.texto_comentario && this.texto_comentario.length > 5000) {
            errors.push('El comentario no puede exceder 5000 caracteres');
        }

        return errors;
    }

    // Método para obtener datos serializables
    toJSON() {
        return {
            id_comentario: this.id_comentario,
            id_historial: this.id_historial,
            id_usuario: this.id_usuario,
            texto_comentario: this.texto_comentario,
            fecha_hora_comentario: this.fecha_hora_comentario
        };
    }
}

module.exports = ComentarioEstado;
