const BaseEntity = require('./BaseEntity');

class BloqueoEstado extends BaseEntity {
    constructor(data) {
        super();
        this.id_bloqueo = data.id_bloqueo;
        this.id_historial = data.id_historial;
        this.id_usuario = data.id_usuario;
        this.descripcion_bloqueo = data.descripcion_bloqueo;
        this.respuesta_cliente = data.respuesta_cliente || null;
        this.fecha_hora_bloqueo = data.fecha_hora_bloqueo || new Date();
        this.estado_bloqueado = data.estado_bloqueado ?? true;
    }

    validate() {
        const errors = [];

        if (!this.id_historial) {
            errors.push('El ID del historial es requerido');
        }

        if (!this.id_usuario) {
            errors.push('El ID del usuario es requerido');
        }

        if (!this.descripcion_bloqueo || this.descripcion_bloqueo.trim() === '') {
            errors.push('La descripcion del bloqueo es requerida');
        }

        if (this.descripcion_bloqueo && this.descripcion_bloqueo.length > 5000) {
            errors.push('La descripcion del bloqueo no puede exceder 5000 caracteres');
        }

        return errors;
    }

    toJSON() {
        return {
            id_bloqueo: this.id_bloqueo,
            id_historial: this.id_historial,
            id_usuario: this.id_usuario,
            descripcion_bloqueo: this.descripcion_bloqueo,
            respuesta_cliente: this.respuesta_cliente,
            fecha_hora_bloqueo: this.fecha_hora_bloqueo,
            estado_bloqueado: this.estado_bloqueado
        };
    }
}

module.exports = BloqueoEstado;
