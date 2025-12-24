const BaseEntity = require('./BaseEntity');

class Estado extends BaseEntity {
    constructor(data) {
        super();
        this.id_estado = data.id_estado;
        this.nombre_estado = data.nombre_estado;
        this.descripcion_estado = data.descripcion_estado || null;
    }

    // Validaciones de negocio
    validate() {
        const errors = [];

        if (!this.nombre_estado || this.nombre_estado.trim() === '') {
            errors.push('El nombre del estado es requerido');
        }

        if (this.nombre_estado && this.nombre_estado.length > 100) {
            errors.push('El nombre del estado no puede exceder 100 caracteres');
        }

        return errors;
    }

    // Método para obtener datos serializables
    toJSON() {
        return {
            id_estado: this.id_estado,
            nombre_estado: this.nombre_estado,
            descripcion_estado: this.descripcion_estado
        };
    }
}

module.exports = Estado;
