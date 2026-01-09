const IOrdenRepository = require('../../domain/repositories/IOrdenRepository');
const Orden = require('../../domain/entities/Orden');
const { getPrisma } = require('../database/db');

class OrdenRepository extends IOrdenRepository {
    constructor() {
        super();
    }

    getPrisma() {
        const prisma = getPrisma();
        if (!prisma) {
            throw new Error('Prisma no está conectado. Asegúrate de que el servidor se haya iniciado correctamente.');
        }
        return prisma;
    }

    // Incluir relaciones completas en las consultas
    getIncludeRelations() {
        return {
            clientes: {
                select: {
                    id_cliente: true,
                    nombre_completo: true,
                    correo_electronico: true,
                    telefono_contacto: true,
                    numero_identificacion: true,
                    tipo_identificacion: true,
                    tipo_direccion: true,
                    direccion: true,
                    notas_cliente: true
                }
            },
            productos: {
                select: {
                    id_producto: true,
                    nombre_producto: true,
                    identificador_interno: true,
                    modelo: true,
                    numero_serie: true,
                    descripcion: true,
                    identificador_unico_adicional: true,
                    notas_producto: true
                }
            },
            flujos: {
                select: {
                    id_flujo: true,
                    nombre_flujo: true,
                    descripcion_flujo: true,
                    activo: true
                }
            },
            estados: {
                select: {
                    id_estado: true,
                    nombre_estado: true,
                    descripcion_estado: true
                }
            }
        };
    }

    async findById(id) {
        try {
            const orden = await this.getPrisma().ordenes.findUnique({
                where: { id_orden: parseInt(id) },
                include: this.getIncludeRelations()
            });

            if (!orden) {
                return null;
            }

            return new Orden(orden);
        } catch (error) {
            console.error('Error en findById:', error);
            throw error;
        }
    }

    async findAll(options = {}) {
        try {
            const queryOptions = {
                include: this.getIncludeRelations(),
                orderBy: { fecha_creacion: 'desc' }
            };

            // Si se pasan opciones adicionales (where, include, etc.)
            if (options.where) {
                queryOptions.where = options.where;
            }
            if (options.include) {
                queryOptions.include = { ...queryOptions.include, ...options.include };
            }
            if (options.orderBy) {
                queryOptions.orderBy = options.orderBy;
            }

            const ordenes = await this.getPrisma().ordenes.findMany(queryOptions);

            return ordenes.map(orden => new Orden(orden));
        } catch (error) {
            console.error('Error en findAll:', error);
            throw error;
        }
    }

    async findByCliente(idCliente) {
        try {
            const ordenes = await this.getPrisma().ordenes.findMany({
                where: { id_cliente: parseInt(idCliente) },
                include: this.getIncludeRelations(),
                orderBy: { fecha_creacion: 'desc' }
            });

            return ordenes.map(orden => new Orden(orden));
        } catch (error) {
            console.error('Error en findByCliente:', error);
            throw error;
        }
    }

    async findByEstado(idEstado) {
        try {
            const ordenes = await this.getPrisma().ordenes.findMany({
                where: { id_estado_actual: parseInt(idEstado) },
                include: this.getIncludeRelations(),
                orderBy: { fecha_creacion: 'desc' }
            });

            return ordenes.map(orden => new Orden(orden));
        } catch (error) {
            console.error('Error en findByEstado:', error);
            throw error;
        }
    }

    async findByFlujo(idFlujo) {
        try {
            const ordenes = await this.getPrisma().ordenes.findMany({
                where: { id_flujo: parseInt(idFlujo) },
                include: this.getIncludeRelations(),
                orderBy: { fecha_creacion: 'desc' }
            });

            return ordenes.map(orden => new Orden(orden));
        } catch (error) {
            console.error('Error en findByFlujo:', error);
            throw error;
        }
    }

    async create(orden) {
        try {
            const nuevaOrden = await this.getPrisma().ordenes.create({
                data: {
                    id_cliente: parseInt(orden.id_cliente),
                    id_producto: parseInt(orden.id_producto),
                    id_flujo: parseInt(orden.id_flujo),
                    id_estado_actual: parseInt(orden.id_estado_actual),
                    descripcion_servicio: orden.descripcion_servicio,
                    condiciones_pago: orden.condiciones_pago || null,
                    fecha_estimada_entrega: orden.fecha_estimada_entrega ? new Date(orden.fecha_estimada_entrega) : null,
                    notas_orden: orden.notas_orden || null
                },
                include: this.getIncludeRelations()
            });

            return new Orden(nuevaOrden);
        } catch (error) {
            console.error('Error en create:', error);
            throw error;
        }
    }

    async update(id, ordenData) {
        try {
            const dataToUpdate = {};

            const allowedFields = [
                'descripcion_servicio',
                'condiciones_pago',
                'fecha_estimada_entrega',
                'fecha_cierre',
                'notas_orden'
            ];

            allowedFields.forEach(field => {
                if (ordenData[field] !== undefined) {
                    if (field === 'fecha_estimada_entrega' || field === 'fecha_cierre') {
                        dataToUpdate[field] = ordenData[field] ? new Date(ordenData[field]) : null;
                    } else {
                        dataToUpdate[field] = ordenData[field];
                    }
                }
            });

            if (Object.keys(dataToUpdate).length === 0) {
                throw new Error('No hay campos para actualizar');
            }

            const ordenActualizada = await this.getPrisma().ordenes.update({
                where: { id_orden: parseInt(id) },
                data: dataToUpdate,
                include: this.getIncludeRelations()
            });

            return new Orden(ordenActualizada);
        } catch (error) {
            if (error.code === 'P2025') {
                return null;
            }
            console.error('Error en update:', error);
            throw error;
        }
    }

    async cambiarEstado(idOrden, nuevoEstadoId) {
        try {
            const ordenActualizada = await this.getPrisma().ordenes.update({
                where: { id_orden: parseInt(idOrden) },
                data: { id_estado_actual: parseInt(nuevoEstadoId) },
                include: this.getIncludeRelations()
            });

            return new Orden(ordenActualizada);
        } catch (error) {
            if (error.code === 'P2025') {
                return null;
            }
            console.error('Error en cambiarEstado:', error);
            throw error;
        }
    }

    async updateFechaEntrega(idOrden, nuevaFecha) {
        try {
            const ordenActualizada = await this.getPrisma().ordenes.update({
                where: { id_orden: parseInt(idOrden) },
                data: { fecha_estimada_entrega: new Date(nuevaFecha) },
                include: this.getIncludeRelations()
            });

            return new Orden(ordenActualizada);
        } catch (error) {
            if (error.code === 'P2025') {
                return null;
            }
            console.error('Error en updateFechaEntrega:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            await this.getPrisma().ordenes.delete({
                where: { id_orden: parseInt(id) }
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
}

module.exports = OrdenRepository;
