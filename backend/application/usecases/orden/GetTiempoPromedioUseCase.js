const { getPrisma } = require('../../../infrastructure/database/db');

class GetTiempoPromedioUseCase {
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
     * Calcula el tiempo promedio de finalización de órdenes
     * @param {Object} params - Parámetros de filtrado
     * @param {number} params.id_flujo - ID del flujo para filtrar (opcional)
     * @returns {Promise<Object>} - Tiempos promedio por flujo
     */
    async execute({ id_flujo = null } = {}) {
        try {
            const prisma = this.getPrisma();

            // Construir filtro
            const where = {
                fecha_cierre: {
                    not: null // Solo órdenes cerradas
                }
            };

            if (id_flujo) {
                where.id_flujo = parseInt(id_flujo);
            }

            // Obtener órdenes cerradas con sus flujos
            const ordenesCerradas = await prisma.ordenes.findMany({
                where,
                select: {
                    id_orden: true,
                    id_flujo: true,
                    fecha_creacion: true,
                    fecha_cierre: true,
                    flujos: {
                        select: {
                            id_flujo: true,
                            nombre_flujo: true
                        }
                    }
                }
            });

            if (ordenesCerradas.length === 0) {
                return {
                    success: true,
                    data: {
                        total_ordenes: 0,
                        promedio_general_dias: 0,
                        promedio_general_horas: 0,
                        por_flujo: [],
                        filtrado_por: id_flujo ? 'flujo_especifico' : 'todos'
                    }
                };
            }

            // Calcular tiempos para cada orden
            const ordenesConTiempo = ordenesCerradas.map(orden => {
                const inicio = new Date(orden.fecha_creacion);
                const fin = new Date(orden.fecha_cierre);
                const diferenciaMs = fin - inicio;
                const dias = diferenciaMs / (1000 * 60 * 60 * 24);
                const horas = diferenciaMs / (1000 * 60 * 60);

                return {
                    id_orden: orden.id_orden,
                    id_flujo: orden.id_flujo,
                    nombre_flujo: orden.flujos.nombre_flujo,
                    dias: parseFloat(dias.toFixed(2)),
                    horas: parseFloat(horas.toFixed(2))
                };
            });

            // Calcular promedio general
            const totalDias = ordenesConTiempo.reduce((sum, o) => sum + o.dias, 0);
            const totalHoras = ordenesConTiempo.reduce((sum, o) => sum + o.horas, 0);
            const promedioDias = totalDias / ordenesConTiempo.length;
            const promedioHoras = totalHoras / ordenesConTiempo.length;

            // Agrupar por flujo
            const porFlujo = {};
            ordenesConTiempo.forEach(orden => {
                if (!porFlujo[orden.id_flujo]) {
                    porFlujo[orden.id_flujo] = {
                        id_flujo: orden.id_flujo,
                        nombre_flujo: orden.nombre_flujo,
                        total_ordenes: 0,
                        suma_dias: 0,
                        suma_horas: 0
                    };
                }
                porFlujo[orden.id_flujo].total_ordenes++;
                porFlujo[orden.id_flujo].suma_dias += orden.dias;
                porFlujo[orden.id_flujo].suma_horas += orden.horas;
            });

            // Calcular promedios por flujo
            const promediosPorFlujo = Object.values(porFlujo).map(flujo => ({
                id_flujo: flujo.id_flujo,
                nombre_flujo: flujo.nombre_flujo,
                total_ordenes: flujo.total_ordenes,
                promedio_dias: parseFloat((flujo.suma_dias / flujo.total_ordenes).toFixed(2)),
                promedio_horas: parseFloat((flujo.suma_horas / flujo.total_ordenes).toFixed(2))
            }));

            return {
                success: true,
                data: {
                    total_ordenes: ordenesConTiempo.length,
                    promedio_general_dias: parseFloat(promedioDias.toFixed(2)),
                    promedio_general_horas: parseFloat(promedioHoras.toFixed(2)),
                    por_flujo: promediosPorFlujo,
                    filtrado_por: id_flujo ? 'flujo_especifico' : 'todos'
                }
            };

        } catch (error) {
            console.error('Error al calcular tiempo promedio:', error);
            throw new Error('Error al calcular tiempo promedio de finalización');
        }
    }
}

module.exports = GetTiempoPromedioUseCase;
