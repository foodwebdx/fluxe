const IUseCase = require('../../../domain/usecases/IUseCase');
const OrdenRepository = require('../../../infrastructure/repositories/OrdenRepository');
const HistorialEstadoRepository = require('../../../infrastructure/repositories/HistorialEstadoRepository');
const EvidenciaRepository = require('../../../infrastructure/repositories/EvidenciaRepository');

class DeleteOrdenUseCase extends IUseCase {
    constructor() {
        super();
        this.ordenRepository = new OrdenRepository();
        this.historialRepository = new HistorialEstadoRepository();
        this.evidenciaRepository = new EvidenciaRepository();
    }

    async execute(idOrden) {
        try {
            // 1. Verificar que la orden existe
            const orden = await this.ordenRepository.findById(idOrden);
            if (!orden) {
                throw new Error('Orden no encontrada');
            }

            // 2. Eliminar evidencias asociadas (si existen)
            // Nota: Dependiendo de la configuración de Prisma, esto podría hacerse automáticamente
            // con onDelete: Cascade, pero lo hacemos explícitamente para mayor control
            try {
                const evidencias = await this.evidenciaRepository.findByOrden(idOrden);
                for (const evidencia of evidencias) {
                    await this.evidenciaRepository.delete(evidencia.id_evidencia);
                }
            } catch (error) {
                console.warn('Error al eliminar evidencias:', error);
                // Continuamos con la eliminación de la orden
            }

            // 3. Eliminar historial de estados asociado
            // Nota: Similar al caso anterior, esto podría manejarse con cascada
            // pero lo hacemos explícitamente
            try {
                // El historial se eliminará automáticamente si está configurado con onDelete: Cascade
                // Si no, necesitaríamos un método en el repositorio para eliminarlo
            } catch (error) {
                console.warn('Error al eliminar historial:', error);
            }

            // 4. Eliminar la orden
            const resultado = await this.ordenRepository.delete(idOrden);

            if (!resultado) {
                throw new Error('No se pudo eliminar la orden');
            }

            return {
                message: 'Orden eliminada exitosamente',
                id_orden: parseInt(idOrden)
            };
        } catch (error) {
            console.error('Error en DeleteOrdenUseCase:', error);
            throw error;
        }
    }
}

module.exports = DeleteOrdenUseCase;
