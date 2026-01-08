const BaseEntity = require('./BaseEntity');

class Encuesta extends BaseEntity {
    constructor(data = {}) {
        super();
        this.id_orden = data.id_orden;
        this.comentario = data.comentario || null;
        this.satisfaccion_servicio = data.satisfaccion_servicio;
        this.satisfaccion_tiempo = data.satisfaccion_tiempo;
        this.satisfaccion_general = data.satisfaccion_general;
        this.fecha_respuesta = data.fecha_respuesta || new Date();
    }

    validate() {
        const errors = [];

        if (!this.id_orden) {
            errors.push('El ID de la orden es requerido');
        }

        const campos = [
            { key: 'satisfaccion_servicio', label: 'satisfaccion_servicio', value: this.satisfaccion_servicio },
            { key: 'satisfaccion_tiempo', label: 'satisfaccion_tiempo', value: this.satisfaccion_tiempo },
            { key: 'satisfaccion_general', label: 'satisfaccion_general', value: this.satisfaccion_general }
        ];

        campos.forEach(({ label, value }) => {
            if (value === undefined || value === null || value === '') {
                errors.push(`El campo ${label} es requerido`);
                return;
            }

            const parsed = Number(value);
            if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
                errors.push(`El campo ${label} debe estar entre 1 y 5`);
            }
        });

        return errors;
    }

    toJSON() {
        return {
            id_orden: this.id_orden,
            comentario: this.comentario,
            satisfaccion_servicio: this.satisfaccion_servicio,
            satisfaccion_tiempo: this.satisfaccion_tiempo,
            satisfaccion_general: this.satisfaccion_general,
            fecha_respuesta: this.fecha_respuesta
        };
    }
}

module.exports = Encuesta;
