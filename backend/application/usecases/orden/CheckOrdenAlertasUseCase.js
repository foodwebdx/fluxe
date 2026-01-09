const IUseCase = require('../../../domain/usecases/IUseCase');
const { getPrisma } = require('../../../infrastructure/database/db');

/**
 * Caso de uso para verificar alertas de órdenes próximas a vencer
 */
class CheckOrdenAlertasUseCase extends IUseCase {
    constructor(ordenRepository, usuarioRepository) {
        super();
        this.ordenRepository = ordenRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Obtiene el último estado de cada flujo
     * @returns {Promise<Map>} - Map con id_flujo -> id_estado_final
     */
    async obtenerEstadosFinalesPorFlujo() {
        const prisma = getPrisma();
        
        // Obtener todos los flujos con sus estados ordenados por posición
        const flujos = await prisma.flujos.findMany({
            include: {
                flujos_estados: {
                    orderBy: {
                        posicion: 'desc'
                    },
                    take: 1 // Solo el último (mayor posición)
                }
            }
        });

        // Crear un mapa de id_flujo -> id_estado_final
        const estadosFinales = new Map();
        flujos.forEach(flujo => {
            if (flujo.flujos_estados && flujo.flujos_estados.length > 0) {
                estadosFinales.set(flujo.id_flujo, flujo.flujos_estados[0].id_estado);
            }
        });

        return estadosFinales;
    }

    /**
     * Ejecuta la verificación de alertas
     * @param {number} diasAntes - Días antes de la fecha de entrega para alertar (default: 2)
     * @returns {Promise<Object>} - Órdenes con alerta
     */
    async execute({ diasAntes = 2 } = {}) {
        try {
            // Calcular la fecha límite (hoy + diasAntes)
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() + diasAntes);
            fechaLimite.setHours(23, 59, 59, 999); // Final del día

            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0); // Inicio del día

            console.log(`🔍 Buscando órdenes entre fecha pasada y ${fechaLimite.toISOString()}`);
            console.log(`📅 Fecha actual: ${new Date().toLocaleString('es-CO')}`);

            // Obtener los estados finales de cada flujo
            const estadosFinales = await this.obtenerEstadosFinalesPorFlujo();

            // Primero, obtener TODAS las órdenes para debug
            const todasOrdenes = await this.ordenRepository.findAll({
                include: {
                    clientes: true,
                    productos: true,
                    estados: true,
                    flujos: true
                }
            });

            console.log(`\n📊 DEBUG - Total de órdenes en BD: ${todasOrdenes.length}`);
            todasOrdenes.forEach(orden => {
                if (orden.fecha_estimada_entrega) {
                    const fechaEntrega = new Date(orden.fecha_estimada_entrega);
                    console.log(`  Orden #${orden.id_orden}: ${fechaEntrega.toLocaleDateString('es-CO')} - Cerrada: ${orden.fecha_cierre ? 'Sí' : 'No'} - Estado: ${orden.estados?.nombre_estado}`);
                }
            });
            console.log('');

            // Buscar órdenes con fecha_estimada_entrega <= fechaLimite
            // Esto incluye tanto órdenes próximas a vencer como órdenes ya vencidas
            const ordenes = await this.ordenRepository.findAll({
                where: {
                    fecha_estimada_entrega: {
                        lte: fechaLimite // Hasta la fecha límite (incluye fechas pasadas)
                    },
                    fecha_cierre: null // Solo órdenes activas
                },
                include: {
                    clientes: true,
                    productos: true,
                    estados: true,
                    flujos: true
                }
            });

            // Filtrar órdenes que NO estén en el último estado de su flujo
            const ordenesActivas = ordenes.filter(orden => {
                const estadoFinalFlujo = estadosFinales.get(orden.id_flujo);
                const esEstadoFinal = orden.id_estado_actual === estadoFinalFlujo;
                
                if (esEstadoFinal) {
                    console.log(`⏭️ Orden #${orden.id_orden} está en estado final (${orden.estados?.nombre_estado}), se omite`);
                }
                
                return !esEstadoFinal;
            });

            console.log(`📋 Total de órdenes encontradas: ${ordenes.length}`);
            console.log(`✅ Órdenes activas (no en estado final): ${ordenesActivas.length}`);

            // Calcular días restantes para cada orden
            const ordenesConAlerta = ordenesActivas.map(orden => {
                const fechaEntrega = new Date(orden.fecha_estimada_entrega);
                const diffTime = fechaEntrega.getTime() - hoy.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Determinar nivel de urgencia
                let nivel_urgencia;
                if (diffDays < 0) {
                    // Orden vencida (fecha de entrega ya pasó)
                    nivel_urgencia = 'VENCIDO';
                } else if (diffDays === 0) {
                    nivel_urgencia = 'CRITICO';
                } else if (diffDays === 1) {
                    nivel_urgencia = 'ALTO';
                } else {
                    nivel_urgencia = 'MEDIO';
                }

                return {
                    ...orden,
                    dias_restantes: diffDays,
                    nivel_urgencia: nivel_urgencia,
                    dias_retraso: diffDays < 0 ? Math.abs(diffDays) : 0
                };
            });

            // Obtener usuarios admin para notificar
            const admins = await this.usuarioRepository.findAdmins();

            return {
                success: true,
                ordenes: ordenesConAlerta,
                total: ordenesConAlerta.length,
                admins: admins,
                fecha_verificacion: new Date()
            };

        } catch (error) {
            console.error('Error en CheckOrdenAlertasUseCase:', error);
            throw error;
        }
    }
}

module.exports = CheckOrdenAlertasUseCase;
