const IEstadoRepository = require('../../domain/repositories/IEstadoRepository');
const Estado = require('../../domain/entities/Estado');
const { getPrisma } = require('../database/db');

class EstadoRepository extends IEstadoRepository {
    constructor() {
        super();
    }

    // Obtener el cliente Prisma
    getPrisma() {
        const prisma = getPrisma();
        if (!prisma) {
            throw new Error('Prisma no está conectado. Asegúrate de que el servidor se haya iniciado correctamente.');
        }
        return prisma;
    }

    async findById(id) {
        try {
            const estado = await this.getPrisma().estados.findUnique({
                where: { id_estado: parseInt(id) }
            });

            if (!estado) {
                return null;
            }

            return new Estado(estado);
        } catch (error) {
            console.error('Error en findById:', error);
            throw error;
        }
    }

    async findAll() {
        try {
            const estados = await this.getPrisma().estados.findMany({
                orderBy: { nombre_estado: 'asc' }
            });

            return estados.map(estado => new Estado(estado));
        } catch (error) {
            console.error('Error en findAll:', error);
            throw error;
        }
    }

    async findByNombre(nombreEstado) {
        try {
            const estado = await this.getPrisma().estados.findUnique({
                where: { nombre_estado: nombreEstado }
            });

            if (!estado) {
                return null;
            }

            return new Estado(estado);
        } catch (error) {
            console.error('Error en findByNombre:', error);
            throw error;
        }
    }

    async create(estadoData) {
        try {
            // Validar que no exista un estado con el mismo nombre
            const existente = await this.findByNombre(estadoData.nombre_estado);
            if (existente) {
                throw new Error('Ya existe un estado con ese nombre');
            }

            const nuevoEstado = await this.getPrisma().estados.create({
                data: {
                    nombre_estado: estadoData.nombre_estado,
                    descripcion_estado: estadoData.descripcion_estado || null
                }
            });

            return new Estado(nuevoEstado);
        } catch (error) {
            console.error('Error en create:', error);
            throw error;
        }
    }

    async update(id, estadoData) {
        try {
            // Si se está actualizando el nombre, validar que no exista otro con ese nombre
            if (estadoData.nombre_estado) {
                const existente = await this.findByNombre(estadoData.nombre_estado);
                if (existente && existente.id_estado !== parseInt(id)) {
                    throw new Error('Ya existe otro estado con ese nombre');
                }
            }

            const dataToUpdate = {};

            if (estadoData.nombre_estado !== undefined) {
                dataToUpdate.nombre_estado = estadoData.nombre_estado;
            }

            if (estadoData.descripcion_estado !== undefined) {
                dataToUpdate.descripcion_estado = estadoData.descripcion_estado;
            }

            if (Object.keys(dataToUpdate).length === 0) {
                throw new Error('No hay campos para actualizar');
            }

            const estadoActualizado = await this.getPrisma().estados.update({
                where: { id_estado: parseInt(id) },
                data: dataToUpdate
            });

            return new Estado(estadoActualizado);
        } catch (error) {
            if (error.code === 'P2025') {
                return null;
            }
            console.error('Error en update:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            // Validar que el estado no esté en uso
            const enUso = await this.isInUse(parseInt(id));
            if (enUso) {
                throw new Error('No se puede eliminar: el estado está en uso en flujos activos');
            }

            await this.getPrisma().estados.delete({
                where: { id_estado: parseInt(id) }
            });

            return true;
        } catch (error) {
            if (error.code === 'P2025') {
                return false;
            }
            console.error('Error en delete:', error);
            throw error;
        }
    }

    async isInUse(idEstado) {
        try {
            // Verificar si el estado está en uso en flujos_estados
            const enFlujos = await this.getPrisma().flujos_estados.findFirst({
                where: {
                    id_estado: parseInt(idEstado),
                    flujos: {
                        activo: true
                    }
                }
            });

            // Verificar si hay órdenes con este estado
            const enOrdenes = await this.getPrisma().ordenes.findFirst({
                where: { id_estado_actual: parseInt(idEstado) }
            });

            return !!(enFlujos || enOrdenes);
        } catch (error) {
            console.error('Error en isInUse:', error);
            throw error;
        }
    }
}

module.exports = EstadoRepository;
