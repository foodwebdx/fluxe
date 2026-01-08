const IEncuestaRepository = require('../../domain/repositories/IEncuestaRepository');
const { getPrisma } = require('../database/db');

class EncuestaRepository extends IEncuestaRepository {
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

    getIncludeRelations() {
        return {
            ordenes: {
                select: {
                    id_orden: true,
                    descripcion_servicio: true,
                    fecha_creacion: true
                }
            }
        };
    }

    async create(encuestaData) {
        try {
            const nuevaEncuesta = await this.getPrisma().encuesta.create({
                data: {
                    id_orden: parseInt(encuestaData.id_orden),
                    comentario: encuestaData.comentario || null,
                    satisfaccion_servicio: parseInt(encuestaData.satisfaccion_servicio),
                    satisfaccion_tiempo: parseInt(encuestaData.satisfaccion_tiempo),
                    satisfaccion_general: parseInt(encuestaData.satisfaccion_general),
                    fecha_respuesta: encuestaData.fecha_respuesta || new Date()
                },
                include: this.getIncludeRelations()
            });

            return nuevaEncuesta;
        } catch (error) {
            console.error('Error en create encuesta:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            const encuesta = await this.getPrisma().encuesta.findUnique({
                where: { id_orden: parseInt(id) },
                include: this.getIncludeRelations()
            });

            return encuesta;
        } catch (error) {
            console.error('Error en findById encuesta:', error);
            throw error;
        }
    }

    async findByOrden(idOrden) {
        return this.findById(idOrden);
    }

    async findAll() {
        try {
            const encuestas = await this.getPrisma().encuesta.findMany({
                include: this.getIncludeRelations(),
                orderBy: { fecha_respuesta: 'desc' }
            });

            return encuestas;
        } catch (error) {
            console.error('Error en findAll encuestas:', error);
            throw error;
        }
    }

    async update(id, encuestaData) {
        try {
            const dataToUpdate = {};

            if (encuestaData.comentario !== undefined) {
                dataToUpdate.comentario = encuestaData.comentario;
            }

            if (encuestaData.satisfaccion_servicio !== undefined) {
                dataToUpdate.satisfaccion_servicio = parseInt(encuestaData.satisfaccion_servicio);
            }

            if (encuestaData.satisfaccion_tiempo !== undefined) {
                dataToUpdate.satisfaccion_tiempo = parseInt(encuestaData.satisfaccion_tiempo);
            }

            if (encuestaData.satisfaccion_general !== undefined) {
                dataToUpdate.satisfaccion_general = parseInt(encuestaData.satisfaccion_general);
            }

            const encuestaActualizada = await this.getPrisma().encuesta.update({
                where: { id_orden: parseInt(id) },
                data: dataToUpdate,
                include: this.getIncludeRelations()
            });

            return encuestaActualizada;
        } catch (error) {
            console.error('Error en update encuesta:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const encuestaEliminada = await this.getPrisma().encuesta.delete({
                where: { id_orden: parseInt(id) }
            });

            return encuestaEliminada;
        } catch (error) {
            console.error('Error en delete encuesta:', error);
            throw error;
        }
    }
}

module.exports = EncuestaRepository;
