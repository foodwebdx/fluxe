const { getPrisma } = require('../database/db');

class UsuarioRolRepository {
  constructor() {}

  getPrisma() {
    const prisma = getPrisma();
    if (!prisma) {
      throw new Error('Prisma no esta conectado. Asegurate de que el servidor se haya iniciado correctamente.');
    }
    return prisma;
  }

  async findAll() {
    try {
      return await this.getPrisma().usuarios_roles.findMany({
        include: {
          usuarios: {
            select: {
              id_usuario: true,
              nombre: true,
              email: true,
              usuario_login: true,
            },
          },
          roles: {
            select: {
              id_rol: true,
              nombre_rol: true,
              descripcion_rol: true,
            },
          },
        },
        orderBy: [{ id_usuario: 'asc' }, { id_rol: 'asc' }],
      });
    } catch (error) {
      console.error('Error en findAll usuarios_roles:', error);
      throw error;
    }
  }

  async findByUsuario(idUsuario) {
    try {
      return await this.getPrisma().usuarios_roles.findMany({
        where: { id_usuario: parseInt(idUsuario) },
        include: {
          roles: {
            select: {
              id_rol: true,
              nombre_rol: true,
              descripcion_rol: true,
            },
          },
        },
        orderBy: { id_rol: 'asc' },
      });
    } catch (error) {
      console.error('Error en findByUsuario usuarios_roles:', error);
      throw error;
    }
  }

  async create(assignment) {
    try {
      return await this.getPrisma().usuarios_roles.create({
        data: {
          id_usuario: parseInt(assignment.id_usuario),
          id_rol: parseInt(assignment.id_rol),
        },
        include: {
          roles: {
            select: {
              id_rol: true,
              nombre_rol: true,
              descripcion_rol: true,
            },
          },
          usuarios: {
            select: {
              id_usuario: true,
              nombre: true,
              email: true,
              usuario_login: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error en create usuarios_roles:', error);
      throw error;
    }
  }

  async delete(idUsuario, idRol) {
    try {
      const result = await this.getPrisma().usuarios_roles.deleteMany({
        where: {
          id_usuario: parseInt(idUsuario),
          id_rol: parseInt(idRol),
        },
      });

      return result.count > 0;
    } catch (error) {
      console.error('Error en delete usuarios_roles:', error);
      throw error;
    }
  }
}

module.exports = UsuarioRolRepository;
