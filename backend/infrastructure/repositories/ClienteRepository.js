const IClienteRepository = require('../../domain/repositories/IClienteRepository');
const Cliente = require('../../domain/entities/Cliente');
const { getPool } = require('../database/db');

class ClienteRepository extends IClienteRepository {
  constructor() {
    super();
  }

  // Obtener el pool de forma lazy (cuando se necesite)
  getPool() {
    const pool = getPool();
    if (!pool) {
      throw new Error('La base de datos no está conectada. Asegúrate de que el servidor se haya iniciado correctamente.');
    }
    return pool;
  }

  async findById(id) {
    try {
      const result = await this.getPool().query(
        'SELECT * FROM clientes WHERE id_cliente = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new Cliente(result.rows[0]);
    } catch (error) {
      console.error('Error en findById:', error);
      throw error;
    }
  }

  async findAll() {
    try {
      const result = await this.getPool().query(
        'SELECT * FROM clientes ORDER BY id_cliente DESC'
      );
      
      return result.rows.map(row => new Cliente(row));
    } catch (error) {
      console.error('Error en findAll:', error);
      throw error;
    }
  }

  async create(cliente) {
    try {
      const result = await this.getPool().query(
        `INSERT INTO clientes (
          tipo_identificacion, 
          numero_identificacion, 
          nombre_completo, 
          telefono_contacto, 
          correo_electronico, 
          tipo_direccion, 
          direccion, 
          notas_cliente
        ) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
        [
          cliente.tipo_identificacion,
          cliente.numero_identificacion,
          cliente.nombre_completo,
          cliente.telefono_contacto,
          cliente.correo_electronico,
          cliente.tipo_direccion,
          cliente.direccion,
          cliente.notas_cliente
        ]
      );
      
      return new Cliente(result.rows[0]);
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  async update(id, clienteData) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      // Mapear los campos permitidos
      const allowedFields = [
        'tipo_identificacion',
        'numero_identificacion',
        'nombre_completo',
        'telefono_contacto',
        'correo_electronico',
        'tipo_direccion',
        'direccion',
        'notas_cliente'
      ];

      allowedFields.forEach(field => {
        if (clienteData[field] !== undefined) {
          fields.push(`${field} = $${paramCount}`);
          values.push(clienteData[field]);
          paramCount++;
        }
      });

      if (fields.length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      values.push(id);
      const result = await this.getPool().query(
        `UPDATE clientes 
         SET ${fields.join(', ')} 
         WHERE id_cliente = $${paramCount} 
         RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new Cliente(result.rows[0]);
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const result = await this.getPool().query(
        'DELETE FROM clientes WHERE id_cliente = $1 RETURNING id_cliente',
        [id]
      );
      
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }
}

module.exports = ClienteRepository;
