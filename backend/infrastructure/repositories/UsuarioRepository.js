const IUsuarioRepository = require('../../domain/repositories/IUsuarioRepository');
const { getPrisma } = require('../database/db');

const baseRoleSelect = {
  id_rol: true,
  nombre_rol: true,
  descripcion_rol: true,
};

class UsuarioRepository extends IUsuarioRepository {
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

  formatUsuario(usuario) {
    if (!usuario) {
      return null;
    }

    const roles = (usuario.usuarios_roles || [])
      .map((usuarioRol) => usuarioRol.roles)
      .filter(Boolean);

    return {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      email: usuario.email,
      telefono: usuario.telefono,
      usuario_login: usuario.usuario_login,
      roles,
    };
  }

  async findById(id) {
    try {
      const usuario = await this.getPrisma().usuarios.findUnique({
        where: { id_usuario: parseInt(id) },
        select: {
          id_usuario: true,
          nombre: true,
          email: true,
          telefono: true,
          usuario_login: true,
          usuarios_roles: {
            select: {
              roles: {
                select: baseRoleSelect,
              },
            },
          },
        },
      });

      return this.formatUsuario(usuario);
    } catch (error) {
      console.error('Error en findById usuario:', error);
      throw error;
    }
  }

  async findAll() {
    try {
      const usuarios = await this.getPrisma().usuarios.findMany({
        select: {
          id_usuario: true,
          nombre: true,
          email: true,
          telefono: true,
          usuario_login: true,
          usuarios_roles: {
            select: {
              roles: {
                select: baseRoleSelect,
              },
            },
          },
        },
        orderBy: { id_usuario: 'desc' },
      });

      return usuarios.map((usuario) => this.formatUsuario(usuario));
    } catch (error) {
      console.error('Error en findAll usuarios:', error);
      throw error;
    }
  }

  async findByLoginWithPassword(usuarioLogin) {
    try {
      const usuario = await this.getPrisma().usuarios.findFirst({
        where: { usuario_login: usuarioLogin },
        include: {
          usuarios_roles: {
            include: {
              roles: {
                select: baseRoleSelect,
              },
            },
          },
        },
      });

      return usuario;
    } catch (error) {
      console.error('Error en findByLoginWithPassword usuario:', error);
      throw error;
    }
  }

  async create(usuarioData) {
    try {
      const nuevoUsuario = await this.getPrisma().usuarios.create({
        data: {
          nombre: usuarioData.nombre,
          email: usuarioData.email,
          telefono: usuarioData.telefono || null,
          usuario_login: usuarioData.usuario_login,
          hash_password: usuarioData.hash_password,
        },
        select: {
          id_usuario: true,
          nombre: true,
          email: true,
          telefono: true,
          usuario_login: true,
          usuarios_roles: {
            select: {
              roles: {
                select: baseRoleSelect,
              },
            },
          },
        },
      });

      return this.formatUsuario(nuevoUsuario);
    } catch (error) {
      console.error('Error en create usuario:', error);
      throw error;
    }
  }

  async update(id, usuarioData) {
    try {
      const dataToUpdate = {};
      const allowedFields = ['nombre', 'email', 'telefono', 'usuario_login', 'hash_password'];

      allowedFields.forEach((field) => {
        if (usuarioData[field] !== undefined) {
          dataToUpdate[field] = usuarioData[field];
        }
      });

      if (Object.keys(dataToUpdate).length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      const usuarioActualizado = await this.getPrisma().usuarios.update({
        where: { id_usuario: parseInt(id) },
        data: dataToUpdate,
        select: {
          id_usuario: true,
          nombre: true,
          email: true,
          telefono: true,
          usuario_login: true,
          usuarios_roles: {
            select: {
              roles: {
                select: baseRoleSelect,
              },
            },
          },
        },
      });

      return this.formatUsuario(usuarioActualizado);
    } catch (error) {
      if (error.code === 'P2025') {
        return null;
      }
      console.error('Error en update usuario:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.getPrisma().usuarios.delete({
        where: { id_usuario: parseInt(id) },
      });

      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        return false;
      }
      console.error('Error en delete usuario:', error);
      throw error;
    }
  }
}

module.exports = UsuarioRepository;
