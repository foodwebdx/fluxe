const IRolRepository = require('../../domain/repositories/IRolRepository');
const { getPrisma } = require('../database/db');

class RolRepository extends IRolRepository {
  constructor() {
    super();
  }

  getPrisma() {
    const prisma = getPrisma();
    if (!prisma) {
      throw new Error('Prisma no esta conectado. Asegurate de que el servidor se haya iniciado correctamente.');
    }
    return prisma;
  }

  async findById(id) {
    try {
      const rol = await this.getPrisma().roles.findUnique({
        where: { id_rol: parseInt(id) },
      });

      return rol;
    } catch (error) {
      console.error('Error en findById rol:', error);
      throw error;
    }
  }

  async findAll() {
    try {
      const roles = await this.getPrisma().roles.findMany({
        orderBy: { id_rol: 'desc' },
      });

      return roles;
    } catch (error) {
      console.error('Error en findAll roles:', error);
      throw error;
    }
  }

  async create(rolData) {
    try {
      const nuevoRol = await this.getPrisma().roles.create({
        data: {
          nombre_rol: rolData.nombre_rol,
          descripcion_rol: rolData.descripcion_rol || null,
        },
      });

      return nuevoRol;
    } catch (error) {
      console.error('Error en create rol:', error);
      throw error;
    }
  }

  async update(id, rolData) {
    try {
      const dataToUpdate = {};
      const allowedFields = ['nombre_rol', 'descripcion_rol'];

      allowedFields.forEach((field) => {
        if (rolData[field] !== undefined) {
          dataToUpdate[field] = rolData[field];
        }
      });

      if (Object.keys(dataToUpdate).length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      const rolActualizado = await this.getPrisma().roles.update({
        where: { id_rol: parseInt(id) },
        data: dataToUpdate,
      });

      return rolActualizado;
    } catch (error) {
      if (error.code === 'P2025') {
        return null;
      }
      console.error('Error en update rol:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.getPrisma().roles.delete({
        where: { id_rol: parseInt(id) },
      });

      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        return false;
      }
      console.error('Error en delete rol:', error);
      throw error;
    }
  }
}

module.exports = RolRepository;
