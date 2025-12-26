const { getPrisma } = require('../database/db');

class EvidenciaRepository {
    constructor() { }

    getPrisma() {
        const prisma = getPrisma();
        if (!prisma) {
            throw new Error('Prisma no está conectado. Asegúrate de que el servidor se haya iniciado correctamente.');
        }
        return prisma;
    }

    async create(evidenciaData) {
        try {
            const nuevaEvidencia = await this.getPrisma().evidencias.create({
                data: {
                    id_orden: parseInt(evidenciaData.id_orden),
                    id_estado: parseInt(evidenciaData.id_estado),
                    id_usuario: parseInt(evidenciaData.id_usuario),
                    tipo_evidencia: evidenciaData.tipo_evidencia,
                    s3_key: evidenciaData.s3_key,
                    nombre_archivo_original: evidenciaData.nombre_archivo_original || null,
                    comentario: evidenciaData.comentario || null,
                    fecha_subida: evidenciaData.fecha_subida || new Date()
                },
                include: {
                    ordenes: {
                        select: {
                            id_orden: true,
                            descripcion_servicio: true
                        }
                    },
                    estados: {
                        select: {
                            id_estado: true,
                            nombre_estado: true
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

            return nuevaEvidencia;
        } catch (error) {
            console.error('Error en create evidencia:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            const evidencia = await this.getPrisma().evidencias.findUnique({
                where: { id_evidencia: parseInt(id) },
                include: {
                    ordenes: {
                        select: {
                            id_orden: true,
                            descripcion_servicio: true
                        }
                    },
                    estados: {
                        select: {
                            id_estado: true,
                            nombre_estado: true
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

            return evidencia;
        } catch (error) {
            console.error('Error en findById evidencia:', error);
            throw error;
        }
    }

    async findByOrden(idOrden) {
        try {
            const evidencias = await this.getPrisma().evidencias.findMany({
                where: { id_orden: parseInt(idOrden) },
                include: {
                    estados: {
                        select: {
                            id_estado: true,
                            nombre_estado: true
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
                orderBy: { fecha_subida: 'desc' }
            });

            return evidencias;
        } catch (error) {
            console.error('Error en findByOrden:', error);
            throw error;
        }
    }

    async findByEstado(idEstado) {
        try {
            const evidencias = await this.getPrisma().evidencias.findMany({
                where: { id_estado: parseInt(idEstado) },
                include: {
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
                    }
                },
                orderBy: { fecha_subida: 'desc' }
            });

            return evidencias;
        } catch (error) {
            console.error('Error en findByEstado:', error);
            throw error;
        }
    }

    async findByTipo(tipoEvidencia) {
        try {
            const evidencias = await this.getPrisma().evidencias.findMany({
                where: { tipo_evidencia: tipoEvidencia },
                include: {
                    ordenes: {
                        select: {
                            id_orden: true,
                            descripcion_servicio: true
                        }
                    },
                    estados: {
                        select: {
                            id_estado: true,
                            nombre_estado: true
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
                orderBy: { fecha_subida: 'desc' }
            });

            return evidencias;
        } catch (error) {
            console.error('Error en findByTipo:', error);
            throw error;
        }
    }

    async findAll() {
        try {
            const evidencias = await this.getPrisma().evidencias.findMany({
                include: {
                    ordenes: {
                        select: {
                            id_orden: true,
                            descripcion_servicio: true
                        }
                    },
                    estados: {
                        select: {
                            id_estado: true,
                            nombre_estado: true
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
                orderBy: { fecha_subida: 'desc' }
            });

            return evidencias;
        } catch (error) {
            console.error('Error en findAll evidencias:', error);
            throw error;
        }
    }

    async update(id, evidenciaData) {
        try {
            const evidenciaActualizada = await this.getPrisma().evidencias.update({
                where: { id_evidencia: parseInt(id) },
                data: {
                    tipo_evidencia: evidenciaData.tipo_evidencia || undefined,
                    nombre_archivo_original: evidenciaData.nombre_archivo_original || undefined,
                    comentario: evidenciaData.comentario !== undefined ? evidenciaData.comentario : undefined
                },
                include: {
                    ordenes: {
                        select: {
                            id_orden: true,
                            descripcion_servicio: true
                        }
                    },
                    estados: {
                        select: {
                            id_estado: true,
                            nombre_estado: true
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

            return evidenciaActualizada;
        } catch (error) {
            console.error('Error en update evidencia:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const evidenciaEliminada = await this.getPrisma().evidencias.delete({
                where: { id_evidencia: parseInt(id) }
            });

            return evidenciaEliminada;
        } catch (error) {
            console.error('Error en delete evidencia:', error);
            throw error;
        }
    }
}

module.exports = EvidenciaRepository;
