const express = require('express');
const { getAlertasScheduler } = require('../../infrastructure/schedulers/AlertasScheduler');

const router = express.Router();

/**
 * GET /api/alertas/status
 * Obtiene el estado del sistema de alertas
 */
router.get('/status', (req, res) => {
    try {
        const scheduler = getAlertasScheduler();
        const status = scheduler.getStatus();

        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('Error getting alertas status:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el estado de las alertas',
            error: error.message
        });
    }
});

/**
 * POST /api/alertas/ejecutar
 * Ejecuta manualmente la verificación de alertas
 * NOTA: Solo para desarrollo/pruebas o ejecución manual por admin
 */
router.post('/ejecutar', async (req, res) => {
    try {
        const scheduler = getAlertasScheduler();
        console.log('📤 Ejecutando verificación manual de alertas...');
        
        const resultado = await scheduler.ejecutarVerificacion();

        res.json({
            success: true,
            message: 'Verificación de alertas ejecutada correctamente',
            data: {
                total_ordenes: resultado.total,
                admins_notificados: resultado.admins.length,
                fecha_verificacion: resultado.fecha_verificacion
            }
        });
    } catch (error) {
        console.error('Error ejecutando alertas manualmente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al ejecutar la verificación de alertas',
            error: error.message
        });
    }
});

module.exports = router;
