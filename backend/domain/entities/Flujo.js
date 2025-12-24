const BaseEntity = require('./BaseEntity');

class Flujo extends BaseEntity {
    constructor(data) {
        super();
        this.id_flujo = data.id_flujo;
        this.nombre_flujo = data.nombre_flujo;
        this.descripcion_flujo = data.descripcion_flujo || null;
        this.activo = data.activo !== undefined ? data.activo : true;

        // Relación con estados (si se incluye)
        this.flujos_estados = data.flujos_estados || [];
    }

    // Validaciones de negocio
    validate() {
        const errors = [];

        if (!this.nombre_flujo || this.nombre_flujo.trim() === '') {
            errors.push('El nombre del flujo es requerido');
        }

        if (this.nombre_flujo && this.nombre_flujo.length > 100) {
            errors.push('El nombre del flujo no puede exceder 100 caracteres');
        }

        return errors;
    }

    // Método para obtener datos serializables
    toJSON() {
        return {
            id_flujo: this.id_flujo,
            nombre_flujo: this.nombre_flujo,
            descripcion_flujo: this.descripcion_flujo,
            activo: this.activo,
            flujos_estados: this.flujos_estados
        };
    }
}

module.exports = Flujo;
