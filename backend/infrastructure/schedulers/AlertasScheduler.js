const cron = require('node-cron');
const CheckOrdenAlertasUseCase = require('../../application/usecases/orden/CheckOrdenAlertasUseCase');
const OrdenRepository = require('../repositories/OrdenRepository');
const UsuarioRepository = require('../repositories/UsuarioRepository');
const AlertasService = require('../services/AlertasService');

/**
 * Scheduler para verificar y enviar alertas de órdenes próximas a vencer
 */
class AlertasScheduler {
    constructor() {
        this.ordenRepository = new OrdenRepository();
        this.usuarioRepository = new UsuarioRepository();
        this.checkAlertasUseCase = new CheckOrdenAlertasUseCase(
            this.ordenRepository,
            this.usuarioRepository
        );
        this.alertasService = new AlertasService();
        this.jobs = [];
    }

    /**
     * Ejecuta la verificación de alertas manualmente
     */
    async ejecutarVerificacion() {
        try {
            const horaInicio = new Date();

            // Verificar órdenes con alerta (2 días antes por defecto)
            const resultado = await this.checkAlertasUseCase.execute({ diasAntes: 2 });

            if (resultado.total > 0) {
                // Enviar alertas a los administradores
                const resultadoEnvio = await this.alertasService.enviarAlertas(
                    resultado.ordenes,
                    resultado.admins
                );

                console.log(`✅ Alertas procesadas:`);
                console.log(`   - Notificaciones enviadas: ${resultadoEnvio.notificaciones_enviadas}`);
                
                if (resultadoEnvio.detalles.errores.length > 0) {
                    console.log(`   - Errores: ${resultadoEnvio.detalles.errores.length}`);
                    resultadoEnvio.detalles.errores.forEach(error => {
                        console.error(`     ❌ ${error.tipo} - ${error.admin}: ${error.error}`);
                    });
                }
            } else {
                console.log('ℹ️ No hay órdenes que requieran alerta en este momento');
            }

            const horaFin = new Date();
            const duracion = (horaFin - horaInicio) / 1000;
            console.log(`⏱️ Verificación completada en ${duracion.toFixed(2)} segundos\n`);

            return resultado;
        } catch (error) {
            console.error('❌ Error en la verificación de alertas:', error);
            throw error;
        }
    }

    /**
     * Inicia el scheduler con los cron jobs configurados
     */
    start() {
        console.log('🚀 Iniciando sistema de alertas automáticas...\n');

        // Job 1: Verificación diaria a las 8:00 AM
        const jobMatutino = cron.schedule('0 8 * * *', async () => {
            console.log('📅 [Cron Job Matutino] - Ejecutando a las 8:00 AM');
            await this.ejecutarVerificacion();
        }, {
            scheduled: true,
            timezone: "America/Bogota"
        });

        // Job 2: Verificación diaria a las 2:00 PM
        const jobVespertino = cron.schedule('0 14 * * *', async () => {
            console.log('📅 [Cron Job Vespertino] - Ejecutando a las 2:00 PM');
            await this.ejecutarVerificacion();
        }, {
            scheduled: true,
            timezone: "America/Bogota"
        });

        // Job 3: Verificación crítica a las 6:00 PM (solo órdenes urgentes)
        const jobCritico = cron.schedule('0 18 * * *', async () => {
            console.log('📅 [Cron Job Crítico] - Ejecutando a las 6:00 PM');
            // Solo verificar órdenes a 1 día o menos
            const resultado = await this.checkAlertasUseCase.execute({ diasAntes: 1 });
            if (resultado.total > 0) {
                await this.alertasService.enviarAlertas(
                    resultado.ordenes,
                    resultado.admins
                );
            }
        }, {
            scheduled: true,
            timezone: "America/Bogota"
        });

        this.jobs = [jobMatutino, jobVespertino, jobCritico];

        console.log('✅ Sistema de alertas configurado:');
        console.log('   📍 Job 1: Verificación matutina - 8:00 AM (Bogotá)');
        console.log('   📍 Job 2: Verificación vespertina - 2:00 PM (Bogotá)');
        console.log('   📍 Job 3: Verificación crítica - 6:00 PM (Bogotá)');
        console.log('   ⏰ Zona horaria: America/Bogota');
        console.log('   🔔 Alertas configuradas: 2 días antes de la entrega');
        console.log('   🚨 Alertas críticas: 1 día o menos\n');

        // Ejecutar verificación inicial (opcional)
        if (process.env.RUN_ALERTS_ON_STARTUP === 'true') {
            console.log('🔄 Ejecutando verificación inicial al iniciar...\n');
            setTimeout(() => {
                this.ejecutarVerificacion().catch(err => {
                    console.error('Error en verificación inicial:', err);
                });
            }, 5000); // Esperar 5 segundos después del inicio
        }
    }

    /**
     * Detiene todos los cron jobs
     */
    stop() {
        console.log('🛑 Deteniendo sistema de alertas...');
        this.jobs.forEach(job => job.stop());
        this.jobs = [];
        console.log('✅ Sistema de alertas detenido');
    }

    /**
     * Obtiene el estado de los jobs
     */
    getStatus() {
        return {
            active: this.jobs.length > 0,
            jobs: this.jobs.length,
            timezone: 'America/Bogota',
            schedules: [
                { name: 'Matutino', time: '08:00', dias_antes: 2 },
                { name: 'Vespertino', time: '14:00', dias_antes: 2 },
                { name: 'Crítico', time: '18:00', dias_antes: 1 }
            ]
        };
    }
}

// Singleton
let schedulerInstance = null;

function getAlertasScheduler() {
    if (!schedulerInstance) {
        schedulerInstance = new AlertasScheduler();
    }
    return schedulerInstance;
}

module.exports = { AlertasScheduler, getAlertasScheduler };
