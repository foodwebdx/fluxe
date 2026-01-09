const { getPrisma } = require('../database/db');

const normalizeBoolean = (value) => {
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'true' || normalized === '1') {
            return true;
        }
        if (normalized === 'false' || normalized === '0') {
            return false;
        }
    }
    if (typeof value === 'number') {
        if (value === 1) return true;
        if (value === 0) return false;
    }
    return undefined;
};

class BloqueoEstadoRepository {
    getPrisma() {
        const prisma = getPrisma();
        if (!prisma) {
            throw new Error('Prisma no esta conectado. Asegurate de que el servidor se haya iniciado correctamente.');
        }
        return prisma;
    }

    async create(bloqueoData) {
        try {
            const normalizedEstado = normalizeBoolean(bloqueoData.estado_bloqueado);
            const data = {
                id_historial: parseInt(bloqueoData.id_historial),
                id_usuario: parseInt(bloqueoData.id_usuario),
                descripcion_bloqueo: bloqueoData.descripcion_bloqueo,
                ...(normalizedEstado !== undefined ? { estado_bloqueado: normalizedEstado } : {}),
                fecha_hora_bloqueo: bloqueoData.fecha_hora_bloqueo || new Date()
            };

            if (Object.prototype.hasOwnProperty.call(bloqueoData, 'respuesta_cliente')) {
                data.respuesta_cliente = bloqueoData.respuesta_cliente;
            }

            const nuevoBloqueo = await this.getPrisma().bloqueos_estado.create({
                data,
                include: {
                    historial_estados_orden: {
                        select: {
                            id_historial: true,
                            id_orden: true,
                            fecha_hora_cambio: true,
                            estados: {
                                select: {
                                    id_estado: true,
                                    nombre_estado: true
                                }
                            }
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

            return nuevoBloqueo;
        } catch (error) {
            console.error('Error en create bloqueo:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            const bloqueo = await this.getPrisma().bloqueos_estado.findUnique({
                where: { id_bloqueo: parseInt(id) },
                include: {
                    historial_estados_orden: {
                        select: {
                            id_historial: true,
                            id_orden: true,
                            fecha_hora_cambio: true,
                            estados: {
                                select: {
                                    id_estado: true,
                                    nombre_estado: true
                                }
                            }
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

            return bloqueo;
        } catch (error) {
            console.error('Error en findById bloqueo:', error);
            throw error;
        }
    }

    async findByHistorial(idHistorial) {
        try {
            const bloqueos = await this.getPrisma().bloqueos_estado.findMany({
                where: { id_historial: parseInt(idHistorial) },
                include: {
                    usuarios: {
                        select: {
                            id_usuario: true,
                            nombre: true,
                            email: true
                        }
                    }
                },
                orderBy: { fecha_hora_bloqueo: 'asc' }
            });

            return bloqueos;
        } catch (error) {
            console.error('Error en findByHistorial bloqueo:', error);
            throw error;
        }
    }

    async findByOrden(idOrden) {
        try {
            const bloqueos = await this.getPrisma().bloqueos_estado.findMany({
                where: {
                    historial_estados_orden: {
                        id_orden: parseInt(idOrden)
                    }
                },
                include: {
                    historial_estados_orden: {
                        select: {
                            id_historial: true,
                            fecha_hora_cambio: true,
                            estados: {
                                select: {
                                    id_estado: true,
                                    nombre_estado: true
                                }
                            }
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
                orderBy: { fecha_hora_bloqueo: 'desc' }
            });

            return bloqueos;
        } catch (error) {
            console.error('Error en findByOrden bloqueo:', error);
            throw error;
        }
    }

    async findActiveByHistorial(idHistorial) {
        try {
            return await this.getPrisma().bloqueos_estado.findFirst({
                where: {
                    id_historial: parseInt(idHistorial),
                    estado_bloqueado: true
                },
                orderBy: { fecha_hora_bloqueo: 'desc' }
            });
        } catch (error) {
            console.error('Error en findActiveByHistorial bloqueo:', error);
            throw error;
        }
    }

    async findActiveByOrdenAndEstado(idOrden, idEstado) {
        try {
            return await this.getPrisma().bloqueos_estado.findFirst({
                where: {
                    estado_bloqueado: true,
                    historial_estados_orden: {
                        id_orden: parseInt(idOrden),
                        id_estado: parseInt(idEstado)
                    }
                },
                orderBy: { fecha_hora_bloqueo: 'desc' }
            });
        } catch (error) {
            console.error('Error en findActiveByOrdenAndEstado bloqueo:', error);
            throw error;
        }
    }

    async findAll() {
        try {
            const bloqueos = await this.getPrisma().bloqueos_estado.findMany({
                include: {
                    historial_estados_orden: {
                        select: {
                            id_historial: true,
                            id_orden: true,
                            fecha_hora_cambio: true,
                            estados: {
                                select: {
                                    id_estado: true,
                                    nombre_estado: true
                                }
                            }
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
                orderBy: { fecha_hora_bloqueo: 'desc' }
            });

            return bloqueos;
        } catch (error) {
            console.error('Error en findAll bloqueos:', error);
            throw error;
        }
    }

    async update(id, bloqueoData) {
        try {
            const normalizedEstado = normalizeBoolean(bloqueoData.estado_bloqueado);
            const data = {
                descripcion_bloqueo: bloqueoData.descripcion_bloqueo || undefined,
                estado_bloqueado: normalizedEstado !== undefined ? normalizedEstado : undefined
            };

            if (Object.prototype.hasOwnProperty.call(bloqueoData, 'respuesta_cliente')) {
                data.respuesta_cliente = bloqueoData.respuesta_cliente;
            }

            const bloqueoActualizado = await this.getPrisma().bloqueos_estado.update({
                where: { id_bloqueo: parseInt(id) },
                data,
                include: {
                    historial_estados_orden: {
                        select: {
                            id_historial: true,
                            id_orden: true,
                            estados: {
                                select: {
                                    id_estado: true,
                                    nombre_estado: true
                                }
                            }
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

            return bloqueoActualizado;
        } catch (error) {
            console.error('Error en update bloqueo:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const bloqueoEliminado = await this.getPrisma().bloqueos_estado.delete({
                where: { id_bloqueo: parseInt(id) }
            });

            return bloqueoEliminado;
        } catch (error) {
            console.error('Error en delete bloqueo:', error);
            throw error;
        }
    }
}

module.exports = BloqueoEstadoRepository;
