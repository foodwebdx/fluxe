const IClienteRepository = require('../../domain/repositories/IClienteRepository');
const Cliente = require('../../domain/entities/Cliente');
const { getPrisma } = require('../database/db');

class ClienteRepository extends IClienteRepository {
  constructor() {
    super();
  }

  // Obtener el cliente Prisma de forma lazy (cuando se necesite)
  getPrisma() {
    const prisma = getPrisma();
    if (!prisma) {
      throw new Error('Prisma no está conectado. Asegúrate de que el servidor se haya iniciado correctamente.');
    }
    return prisma;
  }

  async findById(id) {
    try {
      const cliente = await this.getPrisma().clientes.findUnique({
        where: { id_cliente: parseInt(id) }
      });

      if (!cliente) {
        return null;
      }

      return new Cliente(cliente);
    } catch (error) {
      console.error('Error en findById:', error);
      throw error;
    }
  }

  async findAll() {
    try {
      const clientes = await this.getPrisma().clientes.findMany({
        orderBy: { id_cliente: 'desc' }
      });

      return clientes.map(cliente => new Cliente(cliente));
    } catch (error) {
      console.error('Error en findAll:', error);
      throw error;
    }
  }

  async create(cliente) {
    try {
      const nuevoCliente = await this.getPrisma().clientes.create({
        data: {
          tipo_identificacion: cliente.tipo_identificacion,
          numero_identificacion: cliente.numero_identificacion,
          nombre_completo: cliente.nombre_completo,
          telefono_contacto: cliente.telefono_contacto,
          correo_electronico: cliente.correo_electronico,
          tipo_direccion: cliente.tipo_direccion || null,
          direccion: cliente.direccion || null,
          notas_cliente: cliente.notas_cliente || null
        }
      });

      return new Cliente(nuevoCliente);
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  async update(id, clienteData) {
    try {
      // Crear objeto con solo los campos que están definidos
      const dataToUpdate = {};

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
          dataToUpdate[field] = clienteData[field];
        }
      });

      if (Object.keys(dataToUpdate).length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      const clienteActualizado = await this.getPrisma().clientes.update({
        where: { id_cliente: parseInt(id) },
        data: dataToUpdate
      });

      return new Cliente(clienteActualizado);
    } catch (error) {
      if (error.code === 'P2025') {
        // Cliente no encontrado
        return null;
      }
      console.error('Error en update:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.getPrisma().clientes.delete({
        where: { id_cliente: parseInt(id) }
      });

      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        // Cliente no encontrado
        return false;
      }
      console.error('Error en delete:', error);
      throw error;
    }
  }
}

module.exports = ClienteRepository;
