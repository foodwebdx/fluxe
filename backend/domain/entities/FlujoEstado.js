const BaseEntity = require('./BaseEntity');

class FlujoEstado extends BaseEntity {
    constructor(data) {
        super();
        this.id_flujo = data.id_flujo;
        this.id_estado = data.id_estado;
        this.posicion = data.posicion;
        this.obligatorio = data.obligatorio !== undefined ? data.obligatorio : true;

        // Relaciones (si se incluyen)
        this.estados = data.estados || null;
        this.flujos = data.flujos || null;
    }

    // Validaciones de negocio
    validate() {
        const errors = [];

        if (!this.id_flujo) {
            errors.push('El ID del flujo es requerido');
        }

        if (!this.id_estado) {
            errors.push('El ID del estado es requerido');
        }

        if (!this.posicion || this.posicion < 1) {
            errors.push('La posición debe ser mayor a 0');
        }

        return errors;
    }

    // Método para obtener datos serializables
    toJSON() {
        const data = {
            id_flujo: this.id_flujo,
            id_estado: this.id_estado,
            posicion: this.posicion,
            obligatorio: this.obligatorio
        };

        if (this.estados) {
            data.estado = {
                id_estado: this.estados.id_estado,
                nombre_estado: this.estados.nombre_estado,
                descripcion_estado: this.estados.descripcion_estado
            };
        }

        return data;
    }
}

module.exports = FlujoEstado;
