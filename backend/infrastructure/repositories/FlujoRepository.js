const IFlujoRepository = require('../../domain/repositories/IFlujoRepository');
const Flujo = require('../../domain/entities/Flujo');
const FlujoEstado = require('../../domain/entities/FlujoEstado');
const { getPrisma } = require('../database/db');

class FlujoRepository extends IFlujoRepository {
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
            const flujo = await this.getPrisma().flujos.findUnique({
                where: { id_flujo: parseInt(id) },
                include: {
                    flujos_estados: {
                        include: {
                            estados: true
                        },
                        orderBy: { posicion: 'asc' }
                    }
                }
            });

            if (!flujo) {
                return null;
            }

            return new Flujo(flujo);
        } catch (error) {
            console.error('Error en findById:', error);
            throw error;
        }
    }

    async findAll() {
        try {
            const flujos = await this.getPrisma().flujos.findMany({
                include: {
                    flujos_estados: {
                        include: {
                            estados: true
                        },
                        orderBy: { posicion: 'asc' }
                    }
                },
                orderBy: { nombre_flujo: 'asc' }
            });

            return flujos.map(flujo => new Flujo(flujo));
        } catch (error) {
            console.error('Error en findAll:', error);
            throw error;
        }
    }

    async findByNombre(nombreFlujo) {
        try {
            const flujo = await this.getPrisma().flujos.findUnique({
                where: { nombre_flujo: nombreFlujo }
            });

            if (!flujo) {
                return null;
            }

            return new Flujo(flujo);
        } catch (error) {
            console.error('Error en findByNombre:', error);
            throw error;
        }
    }

    async findActivos() {
        try {
            const flujos = await this.getPrisma().flujos.findMany({
                where: { activo: true },
                include: {
                    flujos_estados: {
                        include: {
                            estados: true
                        },
                        orderBy: { posicion: 'asc' }
                    }
                },
                orderBy: { nombre_flujo: 'asc' }
            });

            return flujos.map(flujo => new Flujo(flujo));
        } catch (error) {
            console.error('Error en findActivos:', error);
            throw error;
        }
    }

    async create(flujoData) {
        try {
            // Validar que no exista un flujo con el mismo nombre
            const existente = await this.findByNombre(flujoData.nombre_flujo);
            if (existente) {
                throw new Error('Ya existe un flujo con ese nombre');
            }

            const nuevoFlujo = await this.getPrisma().flujos.create({
                data: {
                    nombre_flujo: flujoData.nombre_flujo,
                    descripcion_flujo: flujoData.descripcion_flujo || null,
                    activo: flujoData.activo !== undefined ? flujoData.activo : true
                }
            });

            return new Flujo(nuevoFlujo);
        } catch (error) {
            console.error('Error en create:', error);
            throw error;
        }
    }

    async update(id, flujoData) {
        try {
            // Si se está actualizando el nombre, validar que no exista otro con ese nombre
            if (flujoData.nombre_flujo) {
                const existente = await this.findByNombre(flujoData.nombre_flujo);
                if (existente && existente.id_flujo !== parseInt(id)) {
                    throw new Error('Ya existe otro flujo con ese nombre');
                }
            }

            const dataToUpdate = {};

            if (flujoData.nombre_flujo !== undefined) {
                dataToUpdate.nombre_flujo = flujoData.nombre_flujo;
            }

            if (flujoData.descripcion_flujo !== undefined) {
                dataToUpdate.descripcion_flujo = flujoData.descripcion_flujo;
            }

            if (flujoData.activo !== undefined) {
                dataToUpdate.activo = flujoData.activo;
            }

            if (Object.keys(dataToUpdate).length === 0) {
                throw new Error('No hay campos para actualizar');
            }

            const flujoActualizado = await this.getPrisma().flujos.update({
                where: { id_flujo: parseInt(id) },
                data: dataToUpdate,
                include: {
                    flujos_estados: {
                        include: {
                            estados: true
                        },
                        orderBy: { posicion: 'asc' }
                    }
                }
            });

            return new Flujo(flujoActualizado);
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
            // Verificar si hay órdenes usando este flujo
            const ordenesConFlujo = await this.getPrisma().ordenes.findFirst({
                where: { id_flujo: parseInt(id) }
            });

            if (ordenesConFlujo) {
                throw new Error('No se puede eliminar: el flujo está en uso en órdenes existentes');
            }

            await this.getPrisma().flujos.delete({
                where: { id_flujo: parseInt(id) }
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

    async getEstadosFlujo(idFlujo) {
        try {
            const flujosEstados = await this.getPrisma().flujos_estados.findMany({
                where: { id_flujo: parseInt(idFlujo) },
                include: { estados: true },
                orderBy: { posicion: 'asc' }
            });

            return flujosEstados.map(fe => new FlujoEstado(fe));
        } catch (error) {
            console.error('Error en getEstadosFlujo:', error);
            throw error;
        }
    }

    async configurarEstados(idFlujo, estados) {
        try {
            // Validar mínimo 3 estados
            if (estados.length < 3) {
                throw new Error('El flujo debe tener al menos 3 estados (inicio, proceso, fin)');
            }

            // Validar máximo recomendado
            if (estados.length > 7) {
                console.warn('⚠️  Se recomienda máximo 7 estados para simplicidad operativa');
            }

            // Validar que todos los estados existan
            for (const estado of estados) {
                const estadoExiste = await this.getPrisma().estados.findUnique({
                    where: { id_estado: parseInt(estado.id_estado) }
                });

                if (!estadoExiste) {
                    throw new Error(`El estado con ID ${estado.id_estado} no existe`);
                }
            }

            // Eliminar configuración anterior
            await this.getPrisma().flujos_estados.deleteMany({
                where: { id_flujo: parseInt(idFlujo) }
            });

            // Crear nueva configuración
            const configuraciones = estados.map((estado, index) => ({
                id_flujo: parseInt(idFlujo),
                id_estado: parseInt(estado.id_estado),
                posicion: index + 1,
                obligatorio: estado.obligatorio !== undefined ? estado.obligatorio : true
            }));

            await this.getPrisma().flujos_estados.createMany({
                data: configuraciones
            });

            return true;
        } catch (error) {
            console.error('Error en configurarEstados:', error);
            throw error;
        }
    }

    async getPrimerEstado(idFlujo) {
        try {
            const primerEstado = await this.getPrisma().flujos_estados.findFirst({
                where: { id_flujo: parseInt(idFlujo) },
                orderBy: { posicion: 'asc' }
            });

            return primerEstado ? primerEstado.id_estado : null;
        } catch (error) {
            console.error('Error en getPrimerEstado:', error);
            throw error;
        }
    }
}

module.exports = FlujoRepository;
