const BaseEntity = require('./BaseEntity');

class HistorialEstado extends BaseEntity {
    constructor(data) {
        super();
        this.id_historial = data.id_historial;
        this.id_orden = data.id_orden;
        this.id_estado = data.id_estado;
        this.id_usuario_responsable = data.id_usuario_responsable;
        this.fecha_hora_cambio = data.fecha_hora_cambio || new Date();
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

        if (!this.id_usuario_responsable) {
            errors.push('El ID del usuario responsable es requerido');
        }

        return errors;
    }

    // Método para obtener datos serializables
    toJSON() {
        return {
            id_historial: this.id_historial,
            id_orden: this.id_orden,
            id_estado: this.id_estado,
            id_usuario_responsable: this.id_usuario_responsable,
            fecha_hora_cambio: this.fecha_hora_cambio
        };
    }
}

module.exports = HistorialEstado;
