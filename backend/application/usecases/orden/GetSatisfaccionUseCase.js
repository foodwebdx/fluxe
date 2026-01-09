const { getPrisma } = require('../../../infrastructure/database/db');

class GetSatisfaccionUseCase {
    constructor() {
        this.prisma = null;
    }

    getPrisma() {
        if (!this.prisma) {
            this.prisma = getPrisma();
        }
        return this.prisma;
    }

    /**
     * Obtiene las métricas de satisfacción de órdenes
     * @param {Object} params - Parámetros de filtrado
     * @param {number} params.id_flujo - ID del flujo para filtrar (opcional)
     * @returns {Promise<Object>} - Métricas de satisfacción
     */
    async execute({ id_flujo = null } = {}) {
        try {
            const prisma = this.getPrisma();

            // Construir la consulta con join a ordenes para filtrar por flujo
            const whereClause = {};
            
            if (id_flujo) {
                whereClause.ordenes = {
                    id_flujo: parseInt(id_flujo)
                };
            }

            // Obtener todas las encuestas con información de la orden
            const encuestas = await prisma.encuesta.findMany({
                where: whereClause,
                include: {
                    ordenes: {
                        select: {
                            id_flujo: true,
                            flujos: {
                                select: {
                                    nombre_flujo: true
                                }
                            }
                        }
                    }
                }
            });

            if (encuestas.length === 0) {
                return {
                    success: true,
                    data: {
                        total_encuestas: 0,
                        promedios_generales: {
                            satisfaccion_general: 0,
                            satisfaccion_servicio: 0,
                            satisfaccion_tiempo: 0
                        },
                        por_flujo: [],
                        distribucion: {
                            satisfaccion_general: [],
                            satisfaccion_servicio: [],
                            satisfaccion_tiempo: []
                        },
                        filtrado_por: id_flujo ? 'flujo_especifico' : 'todos'
                    }
                };
            }

            // Calcular promedios generales
            const sumaGeneral = encuestas.reduce((sum, e) => sum + e.satisfaccion_general, 0);
            const sumaServicio = encuestas.reduce((sum, e) => sum + e.satisfaccion_servicio, 0);
            const sumaTiempo = encuestas.reduce((sum, e) => sum + e.satisfaccion_tiempo, 0);

            const promediosGenerales = {
                satisfaccion_general: parseFloat((sumaGeneral / encuestas.length).toFixed(2)),
                satisfaccion_servicio: parseFloat((sumaServicio / encuestas.length).toFixed(2)),
                satisfaccion_tiempo: parseFloat((sumaTiempo / encuestas.length).toFixed(2))
            };

            // Agrupar por flujo
            const porFlujo = {};
            encuestas.forEach(encuesta => {
                const idFlujo = encuesta.ordenes.id_flujo;
                const nombreFlujo = encuesta.ordenes.flujos.nombre_flujo;

                if (!porFlujo[idFlujo]) {
                    porFlujo[idFlujo] = {
                        id_flujo: idFlujo,
                        nombre_flujo: nombreFlujo,
                        total_encuestas: 0,
                        suma_general: 0,
                        suma_servicio: 0,
                        suma_tiempo: 0
                    };
                }

                porFlujo[idFlujo].total_encuestas++;
                porFlujo[idFlujo].suma_general += encuesta.satisfaccion_general;
                porFlujo[idFlujo].suma_servicio += encuesta.satisfaccion_servicio;
                porFlujo[idFlujo].suma_tiempo += encuesta.satisfaccion_tiempo;
            });

            // Calcular promedios por flujo
            const promediosPorFlujo = Object.values(porFlujo).map(flujo => ({
                id_flujo: flujo.id_flujo,
                nombre_flujo: flujo.nombre_flujo,
                total_encuestas: flujo.total_encuestas,
                promedios: {
                    satisfaccion_general: parseFloat((flujo.suma_general / flujo.total_encuestas).toFixed(2)),
                    satisfaccion_servicio: parseFloat((flujo.suma_servicio / flujo.total_encuestas).toFixed(2)),
                    satisfaccion_tiempo: parseFloat((flujo.suma_tiempo / flujo.total_encuestas).toFixed(2))
                }
            }));

            // Calcular distribución (conteo de cada calificación 1-5)
            const distribucion = {
                satisfaccion_general: this.calcularDistribucion(encuestas, 'satisfaccion_general'),
                satisfaccion_servicio: this.calcularDistribucion(encuestas, 'satisfaccion_servicio'),
                satisfaccion_tiempo: this.calcularDistribucion(encuestas, 'satisfaccion_tiempo')
            };

            return {
                success: true,
                data: {
                    total_encuestas: encuestas.length,
                    promedios_generales: promediosGenerales,
                    por_flujo: promediosPorFlujo,
                    distribucion: distribucion,
                    filtrado_por: id_flujo ? 'flujo_especifico' : 'todos'
                }
            };

        } catch (error) {
            console.error('Error al obtener métricas de satisfacción:', error);
            throw new Error('Error al obtener métricas de satisfacción');
        }
    }

    /**
     * Calcula la distribución de calificaciones para un campo
     * @param {Array} encuestas - Array de encuestas
     * @param {string} campo - Nombre del campo a analizar
     * @returns {Array} - Distribución de calificaciones
     */
    calcularDistribucion(encuestas, campo) {
        const distribucion = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        encuestas.forEach(encuesta => {
            const valor = encuesta[campo];
            if (valor >= 1 && valor <= 5) {
                distribucion[valor]++;
            }
        });

        return [
            { calificacion: 1, cantidad: distribucion[1] },
            { calificacion: 2, cantidad: distribucion[2] },
            { calificacion: 3, cantidad: distribucion[3] },
            { calificacion: 4, cantidad: distribucion[4] },
            { calificacion: 5, cantidad: distribucion[5] }
        ];
    }
}

module.exports = GetSatisfaccionUseCase;
