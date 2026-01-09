const { getPrisma } = require('../../../infrastructure/database/db');

class GetDashboardMetricsUseCase {
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
     * Obtiene un mapa de flujos con su último estado
     * @returns {Promise<Map>} Map(id_flujo -> id_estado_final)
     */
    async obtenerEstadosFinalesPorFlujo() {
        const prisma = this.getPrisma();
        
        const flujos = await prisma.flujos.findMany({
            include: {
                flujos_estados: {
                    orderBy: {
                        posicion: 'desc'
                    },
                    take: 1
                }
            }
        });

        const estadosFinales = new Map();
        flujos.forEach(flujo => {
            if (flujo.flujos_estados && flujo.flujos_estados.length > 0) {
                estadosFinales.set(flujo.id_flujo, flujo.flujos_estados[0].id_estado);
            }
        });

        return estadosFinales;
    }

    async execute() {
        try {
            const prisma = this.getPrisma();
            
            // Obtener estados finales de cada flujo
            const estadosFinales = await this.obtenerEstadosFinalesPorFlujo();
            
            // Obtener todas las órdenes para clasificarlas correctamente
            const todasLasOrdenes = await prisma.ordenes.findMany({
                select: {
                    id_orden: true,
                    id_flujo: true,
                    id_estado_actual: true,
                    fecha_cierre: true,
                    fecha_creacion: true
                }
            });

            // Clasificar órdenes en activas y cerradas
            const ordenesActivas = todasLasOrdenes.filter(orden => {
                const estadoFinal = estadosFinales.get(orden.id_flujo);
                const estaEnEstadoFinal = orden.id_estado_actual === estadoFinal;
                const tieneFechaCierre = orden.fecha_cierre !== null;
                
                // Una orden está activa si NO está en estado final Y NO tiene fecha de cierre
                return !estaEnEstadoFinal && !tieneFechaCierre;
            });

            const ordenesCerradas = todasLasOrdenes.filter(orden => {
                const estadoFinal = estadosFinales.get(orden.id_flujo);
                const estaEnEstadoFinal = orden.id_estado_actual === estadoFinal;
                const tieneFechaCierre = orden.fecha_cierre !== null;
                
                // Una orden está cerrada si está en estado final Y tiene fecha de cierre
                return estaEnEstadoFinal && tieneFechaCierre;
            });

            // Obtener totales principales
            const [
                totalClientes,
                totalProductos,
                ordenesPorEstado,
                ordenesPorMes,
                ordenesPorSemana
            ] = await Promise.all([
                // Total de clientes
                prisma.clientes.count(),

                // Total de productos
                prisma.productos.count(),

                // Distribución por estado
                prisma.ordenes.groupBy({
                    by: ['id_estado_actual'],
                    _count: {
                        id_orden: true
                    },
                    orderBy: {
                        _count: {
                            id_orden: 'desc'
                        }
                    }
                }),

                // Órdenes creadas por mes (últimos 7 meses)
                this.getOrdenesPorMes(),

                // Actividad de la semana actual
                this.getActividadSemanal()
            ]);

            // Órdenes cerradas en el mes actual
            const inicioMes = new Date();
            inicioMes.setDate(1);
            inicioMes.setHours(0, 0, 0, 0);
            
            const ordenesCerradasMesActual = ordenesCerradas.filter(orden => 
                orden.fecha_cierre && new Date(orden.fecha_cierre) >= inicioMes
            ).length;

            // Obtener nombres de estados para la distribución
            const estadosMap = await this.getEstadosMap();
            const distribucionPorEstado = ordenesPorEstado.map(item => ({
                estado: estadosMap[item.id_estado_actual] || 'Desconocido',
                cantidad: item._count.id_orden
            }));

            // Calcular porcentaje de cambio de órdenes activas
            const cambioOrdenesActivas = await this.calcularCambioOrdenesActivas(estadosFinales);
            
            // Calcular porcentaje de cambio de clientes
            const cambioClientes = await this.calcularCambioClientes();

            return {
                success: true,
                data: {
                    totales: {
                        ordenes: todasLasOrdenes.length,
                        clientes: totalClientes,
                        productos: totalProductos,
                        ordenesActivas: ordenesActivas.length,
                        ordenesCerradas: ordenesCerradasMesActual
                    },
                    cambios: {
                        ordenesActivas: cambioOrdenesActivas,
                        clientes: cambioClientes
                    },
                    distribucionPorEstado,
                    ordenesPorMes,
                    actividadSemanal: ordenesPorSemana
                }
            };
        } catch (error) {
            console.error('Error al obtener métricas del dashboard:', error);
            throw new Error('Error al obtener métricas del dashboard');
        }
    }

    async getOrdenesPorMes() {
        const prisma = this.getPrisma();
        const haceSeteMeses = new Date();
        haceSeteMeses.setMonth(haceSeteMeses.getMonth() - 6);
        haceSeteMeses.setDate(1);
        haceSeteMeses.setHours(0, 0, 0, 0);

        const ordenes = await prisma.$queryRaw`
            SELECT 
                TO_CHAR(fecha_creacion, 'Mon') as mes,
                EXTRACT(MONTH FROM fecha_creacion) as mes_numero,
                COUNT(*) as total
            FROM ordenes
            WHERE fecha_creacion >= ${haceSeteMeses}
            GROUP BY TO_CHAR(fecha_creacion, 'Mon'), EXTRACT(MONTH FROM fecha_creacion)
            ORDER BY EXTRACT(MONTH FROM fecha_creacion)
        `;

        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        
        return ordenes.map(item => ({
            name: meses[parseInt(item.mes_numero) - 1],
            ordenes: parseInt(item.total)
        }));
    }

    async getActividadSemanal() {
        const prisma = this.getPrisma();
        const haceSieteDias = new Date();
        haceSieteDias.setDate(haceSieteDias.getDate() - 6);
        haceSieteDias.setHours(0, 0, 0, 0);

        const actividad = await prisma.$queryRaw`
            SELECT 
                TO_CHAR(fecha_hora_cambio, 'Dy') as dia,
                EXTRACT(DOW FROM fecha_hora_cambio) as dia_numero,
                COUNT(*) as cantidad
            FROM historial_estados_orden
            WHERE fecha_hora_cambio >= ${haceSieteDias}
            GROUP BY TO_CHAR(fecha_hora_cambio, 'Dy'), EXTRACT(DOW FROM fecha_hora_cambio)
            ORDER BY EXTRACT(DOW FROM fecha_hora_cambio)
        `;

        const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        
        // Crear array con todos los días de la semana, inicializados en 0
        const resultado = dias.map((nombre, index) => ({
            name: nombre,
            actividad: 0
        }));

        // Llenar con los datos reales
        actividad.forEach(item => {
            const diaIndex = parseInt(item.dia_numero);
            resultado[diaIndex].actividad = parseInt(item.cantidad);
        });

        return resultado;
    }

    async getEstadosMap() {
        const prisma = this.getPrisma();
        const estados = await prisma.estados.findMany({
            select: {
                id_estado: true,
                nombre_estado: true
            }
        });

        const map = {};
        estados.forEach(estado => {
            map[estado.id_estado] = estado.nombre_estado;
        });

        return map;
    }

    async calcularCambioOrdenesActivas(estadosFinales) {
        const prisma = this.getPrisma();
        const hoy = new Date();
        const hace30Dias = new Date();
        hace30Dias.setDate(hace30Dias.getDate() - 30);
        const hace60Dias = new Date();
        hace60Dias.setDate(hace60Dias.getDate() - 60);

        // Obtener órdenes de los últimos 60 días
        const ordenesRecientes = await prisma.ordenes.findMany({
            where: {
                fecha_creacion: {
                    gte: hace60Dias
                }
            },
            select: {
                id_flujo: true,
                id_estado_actual: true,
                fecha_cierre: true,
                fecha_creacion: true
            }
        });

        // Filtrar órdenes activas de los últimos 30 días
        const ordenesUltimos30 = ordenesRecientes.filter(orden => {
            const estadoFinal = estadosFinales.get(orden.id_flujo);
            const estaEnEstadoFinal = orden.id_estado_actual === estadoFinal;
            const tieneFechaCierre = orden.fecha_cierre !== null;
            const esReciente = new Date(orden.fecha_creacion) >= hace30Dias;
            
            return esReciente && !estaEnEstadoFinal && !tieneFechaCierre;
        }).length;

        // Filtrar órdenes activas entre 30 y 60 días
        const ordenesEntre30y60 = ordenesRecientes.filter(orden => {
            const estadoFinal = estadosFinales.get(orden.id_flujo);
            const estaEnEstadoFinal = orden.id_estado_actual === estadoFinal;
            const tieneFechaCierre = orden.fecha_cierre !== null;
            const fechaCreacion = new Date(orden.fecha_creacion);
            const estaEnRango = fechaCreacion >= hace60Dias && fechaCreacion < hace30Dias;
            
            return estaEnRango && !estaEnEstadoFinal && !tieneFechaCierre;
        }).length;

        if (ordenesEntre30y60 === 0) return 0;
        
        return ((ordenesUltimos30 - ordenesEntre30y60) / ordenesEntre30y60 * 100).toFixed(1);
    }

    async calcularCambioClientes() {
        const prisma = this.getPrisma();
        const hace30Dias = new Date();
        hace30Dias.setDate(hace30Dias.getDate() - 30);

        const clientesNuevos = await prisma.clientes.count({
            where: {
                ordenes: {
                    some: {
                        fecha_creacion: {
                            gte: hace30Dias
                        }
                    }
                }
            }
        });

        const totalClientes = await prisma.clientes.count();

        if (totalClientes === 0) return 0;

        return ((clientesNuevos / totalClientes) * 100).toFixed(1);
    }
}

module.exports = GetDashboardMetricsUseCase;
