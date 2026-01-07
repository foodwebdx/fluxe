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

class ComentarioEstadoRepository {
    constructor() { }

    getPrisma() {
        const prisma = getPrisma();
        if (!prisma) {
            throw new Error('Prisma no está conectado. Asegúrate de que el servidor se haya iniciado correctamente.');
        }
        return prisma;
    }

    async create(comentarioData) {
        try {
            const normalizedPublic = normalizeBoolean(comentarioData.public ?? comentarioData.Public);
            const nuevoComentario = await this.getPrisma().comentarios_estado.create({
                data: {
                    id_historial: parseInt(comentarioData.id_historial),
                    id_usuario: parseInt(comentarioData.id_usuario),
                    texto_comentario: comentarioData.texto_comentario,
                    ...(normalizedPublic !== undefined ? { public: normalizedPublic } : {}),
                    fecha_hora_comentario: comentarioData.fecha_hora_comentario || new Date()
                },
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

            return nuevoComentario;
        } catch (error) {
            console.error('Error en create comentario:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            const comentario = await this.getPrisma().comentarios_estado.findUnique({
                where: { id_comentario: parseInt(id) },
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

            return comentario;
        } catch (error) {
            console.error('Error en findById comentario:', error);
            throw error;
        }
    }

    async findByHistorial(idHistorial) {
        try {
            const comentarios = await this.getPrisma().comentarios_estado.findMany({
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
                orderBy: { fecha_hora_comentario: 'asc' }
            });

            return comentarios;
        } catch (error) {
            console.error('Error en findByHistorial:', error);
            throw error;
        }
    }

    async findByOrden(idOrden) {
        try {
            const comentarios = await this.getPrisma().comentarios_estado.findMany({
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
                orderBy: { fecha_hora_comentario: 'desc' }
            });

            return comentarios;
        } catch (error) {
            console.error('Error en findByOrden:', error);
            throw error;
        }
    }

    async findAll() {
        try {
            const comentarios = await this.getPrisma().comentarios_estado.findMany({
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
                orderBy: { fecha_hora_comentario: 'desc' }
            });

            return comentarios;
        } catch (error) {
            console.error('Error en findAll comentarios:', error);
            throw error;
        }
    }

    async update(id, comentarioData) {
        try {
            const normalizedPublic = normalizeBoolean(comentarioData.public ?? comentarioData.Public);
            const comentarioActualizado = await this.getPrisma().comentarios_estado.update({
                where: { id_comentario: parseInt(id) },
                data: {
                    texto_comentario: comentarioData.texto_comentario || undefined,
                    public: normalizedPublic !== undefined ? normalizedPublic : undefined
                },
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

            return comentarioActualizado;
        } catch (error) {
            console.error('Error en update comentario:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const comentarioEliminado = await this.getPrisma().comentarios_estado.delete({
                where: { id_comentario: parseInt(id) }
            });

            return comentarioEliminado;
        } catch (error) {
            console.error('Error en delete comentario:', error);
            throw error;
        }
    }
}

module.exports = ComentarioEstadoRepository;
