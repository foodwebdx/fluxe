const BaseEntity = require('./BaseEntity');

class Cliente extends BaseEntity {
  constructor(data = {}) {
    super(data.id_cliente || data.id);
    this.id_cliente = data.id_cliente || data.id;
    this.tipo_identificacion = data.tipo_identificacion || '';
    this.numero_identificacion = data.numero_identificacion || '';
    this.nombre_completo = data.nombre_completo || '';
    this.telefono_contacto = data.telefono_contacto || '';
    this.correo_electronico = data.correo_electronico || '';
    this.tipo_direccion = data.tipo_direccion || null;
    this.direccion = data.direccion || null;
    this.notas_cliente = data.notas_cliente || null;
  }
}

module.exports = Cliente;
