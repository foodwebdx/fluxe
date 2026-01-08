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
                    },
                    usuarios: {
                        select: {
                            id_usuario: true,
                            nombre: true,
                            email: true
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

    async findById(id) {
        try {
            const historial = await this.getPrisma().historial_estados_orden.findUnique({
                where: { id_historial: parseInt(id) },
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
                    },
                    usuarios: {
                        select: {
                            id_usuario: true,
                            nombre: true,
                            email: true
                        }
                    },
                    comentarios_estado: {
                        select: {
                            id_comentario: true,
                            texto_comentario: true,
                            fecha_hora_comentario: true,
                            public: true
                        }
                    },
                    bloqueos_estado: {
                        select: {
                            id_bloqueo: true,
                            descripcion_bloqueo: true,
                            fecha_hora_bloqueo: true,
                            estado_bloqueado: true,
                            usuarios: {
                                select: {
                                    id_usuario: true,
                                    nombre: true,
                                    email: true
                                }
                            }
                        }
                    }
                }
            });

            return historial;
        } catch (error) {
            console.error('Error en findById historial:', error);
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
                    },
                    usuarios: {
                        select: {
                            id_usuario: true,
                            nombre: true,
                            email: true
                        }
                    },
                    comentarios_estado: {
                        select: {
                            id_comentario: true,
                            texto_comentario: true,
                            fecha_hora_comentario: true,
                            public: true
                        }
                    },
                    bloqueos_estado: {
                        select: {
                            id_bloqueo: true,
                            descripcion_bloqueo: true,
                            fecha_hora_bloqueo: true,
                            estado_bloqueado: true,
                            usuarios: {
                                select: {
                                    id_usuario: true,
                                    nombre: true,
                                    email: true
                                }
                            }
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

    async findLastByOrden(idOrden) {
        try {
            const historial = await this.getPrisma().historial_estados_orden.findFirst({
                where: { id_orden: parseInt(idOrden) },
                include: {
                    estados: {
                        select: {
                            id_estado: true,
                            nombre_estado: true,
                            descripcion_estado: true
                        }
                    },
                    usuarios: {
                        select: {
                            id_usuario: true,
                            nombre: true,
                            email: true
                        }
                    }
                },
                orderBy: { fecha_hora_cambio: 'desc' }
            });

            return historial;
        } catch (error) {
            console.error('Error en findLastByOrden:', error);
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
                    },
                    usuarios: {
                        select: {
                            id_usuario: true,
                            nombre: true,
                            email: true
                        }
                    },
                    bloqueos_estado: {
                        select: {
                            id_bloqueo: true,
                            descripcion_bloqueo: true,
                            fecha_hora_bloqueo: true,
                            estado_bloqueado: true
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

    async update(id, historialData) {
        try {
            const historialActualizado = await this.getPrisma().historial_estados_orden.update({
                where: { id_historial: parseInt(id) },
                data: {
                    id_usuario_responsable: historialData.id_usuario_responsable
                        ? parseInt(historialData.id_usuario_responsable)
                        : undefined
                },
                include: {
                    estados: {
                        select: {
                            id_estado: true,
                            nombre_estado: true,
                            descripcion_estado: true
                        }
                    },
                    usuarios: {
                        select: {
                            id_usuario: true,
                            nombre: true,
                            email: true
                        }
                    }
                }
            });

            return historialActualizado;
        } catch (error) {
            console.error('Error en update historial:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const historialEliminado = await this.getPrisma().historial_estados_orden.delete({
                where: { id_historial: parseInt(id) }
            });

            return historialEliminado;
        } catch (error) {
            console.error('Error en delete historial:', error);
            throw error;
        }
    }
}

module.exports = HistorialEstadoRepository;
