const BaseEntity = require('./BaseEntity');

class Producto extends BaseEntity {
    constructor(data) {
        super();
        this.id_producto = data.id_producto;
        this.id_cliente = data.id_cliente;
        this.nombre_producto = data.nombre_producto;
        this.identificador_interno = data.identificador_interno || null;
        this.descripcion = data.descripcion || null;
        this.modelo = data.modelo || null;
        this.numero_serie = data.numero_serie || null;
        this.identificador_unico_adicional = data.identificador_unico_adicional || null;
        this.notas_producto = data.notas_producto || null;
    }

    validate() {
        const errors = [];

        if (!this.id_cliente) {
            errors.push('El ID del cliente es requerido');
        }

        if (!this.nombre_producto || this.nombre_producto.trim() === '') {
            errors.push('El nombre del producto es requerido');
        }

        if (errors.length > 0) {
            throw new Error(`Errores de validación: ${errors.join(', ')}`);
        }

        return true;
    }

    toJSON() {
        return {
            id_producto: this.id_producto,
            id_cliente: this.id_cliente,
            nombre_producto: this.nombre_producto,
            identificador_interno: this.identificador_interno,
            descripcion: this.descripcion,
            modelo: this.modelo,
            numero_serie: this.numero_serie,
            identificador_unico_adicional: this.identificador_unico_adicional,
            notas_producto: this.notas_producto,
        };
    }
}

module.exports = Producto;
