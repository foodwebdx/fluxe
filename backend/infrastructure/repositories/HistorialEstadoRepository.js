const { getPrisma } = require('../database/db');

class HistorialEstadoRepository {
    constructor() { }

    getPrisma() {
        const prisma = getPrisma();
        if (!prisma) {
            throw new Error('Prisma no está conectado. Asegúrate de que el servidor se haya iniciado correctamente.');
        }
        return prisma;
    }

    async create(historialData) {
        try {
            const nuevoHistorial = await this.getPrisma().historial_estados_orden.create({
                data: {
                    id_orden: parseInt(historialData.id_orden),
                    id_estado: parseInt(historialData.id_estado),
                    id_usuario_responsable: parseInt(historialData.id_usuario_responsable || 1), // Default user ID
                    fecha_hora_cambio: historialData.fecha_hora_cambio || new Date()
                },
                include: {
                    estados: {
                        select: {
                            id_estado: true,
                            nombre_estado: true,
                            descripcion_estado: true
                        }
                    }
                }
            });

            return nuevoHistorial;
        } catch (error) {
            console.error('Error en create historial:', error);
            throw error;
        }
    }

    async findByOrden(idOrden) {
        try {
            const historial = await this.getPrisma().historial_estados_orden.findMany({
                where: { id_orden: parseInt(idOrden) },
                include: {
                    estados: {
                        select: {
                            id_estado: true,
                            nombre_estado: true,
                            descripcion_estado: true
                        }
                    }
                },
                orderBy: { fecha_hora_cambio: 'asc' }
            });

            return historial;
        } catch (error) {
            console.error('Error en findByOrden:', error);
            throw error;
        }
    }

    async findAll() {
        try {
            const historial = await this.getPrisma().historial_estados_orden.findMany({
                include: {
                    estados: {
                        select: {
                            id_estado: true,
                            nombre_estado: true,
                            descripcion_estado: true
                        }
                    },
                    ordenes: {
                        select: {
                            id_orden: true,
                            descripcion_servicio: true
                        }
                    }
                },
                orderBy: { fecha_hora_cambio: 'desc' }
            });

            return historial;
        } catch (error) {
            console.error('Error en findAll historial:', error);
            throw error;
        }
    }
}

module.exports = HistorialEstadoRepository;
