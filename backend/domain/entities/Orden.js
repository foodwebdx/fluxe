const BaseEntity = require('./BaseEntity');

class Orden extends BaseEntity {
    constructor(data) {
        super();
        this.id_orden = data.id_orden;
        this.id_cliente = data.id_cliente;
        this.id_producto = data.id_producto;
        this.id_flujo = data.id_flujo;
        this.id_estado_actual = data.id_estado_actual;
        this.descripcion_servicio = data.descripcion_servicio || null;
        this.condiciones_pago = data.condiciones_pago || null;
        this.fecha_creacion = data.fecha_creacion || new Date();
        this.fecha_estimada_entrega = data.fecha_estimada_entrega || null;
        this.fecha_cierre = data.fecha_cierre || null;
        this.notas_orden = data.notas_orden || null;

        // Relaciones (si vienen incluidas)
        this.cliente = data.clientes || data.cliente || null;
        this.producto = data.productos || data.producto || null;
        this.flujo = data.flujos || data.flujo || null;
        this.estado_actual = data.estados || data.estado_actual || null;
    }

    validate() {
        const errors = [];

        if (!this.id_cliente) {
            errors.push('El ID del cliente es requerido');
        }

        if (!this.id_producto) {
            errors.push('El ID del producto es requerido');
        }

        if (!this.id_flujo) {
            errors.push('El ID del flujo es requerido');
        }

        if (!this.id_estado_actual) {
            errors.push('El ID del estado actual es requerido');
        }

        if (!this.descripcion_servicio || this.descripcion_servicio.trim() === '') {
            errors.push('La descripción del servicio es requerida');
        }

        if (errors.length > 0) {
            throw new Error(`Errores de validación: ${errors.join(', ')}`);
        }

        return true;
    }

    toJSON() {
        return {
            id_orden: this.id_orden,
            id_cliente: this.id_cliente,
            id_producto: this.id_producto,
            id_flujo: this.id_flujo,
            id_estado_actual: this.id_estado_actual,
            descripcion_servicio: this.descripcion_servicio,
            condiciones_pago: this.condiciones_pago,
            fecha_creacion: this.fecha_creacion,
            fecha_estimada_entrega: this.fecha_estimada_entrega,
            fecha_cierre: this.fecha_cierre,
            notas_orden: this.notas_orden,
            cliente: this.cliente,
            producto: this.producto,
            flujo: this.flujo,
            estado_actual: this.estado_actual,
        };
    }
}

module.exports = Orden;
