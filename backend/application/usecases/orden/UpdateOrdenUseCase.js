const IUseCase = require('../../domain/usecases/IUseCase');
const OrdenRepository = require('../../../infrastructure/repositories/OrdenRepository');

class UpdateOrdenUseCase extends IUseCase {
    constructor() {
        super();
        this.ordenRepository = new OrdenRepository();
    }

    async execute(id, ordenData) {
        try {
            // Verificar que la orden existe
            const ordenExistente = await this.ordenRepository.findById(id);
            if (!ordenExistente) {
                throw new Error('Orden no encontrada');
            }

            // Validar que al menos haya un campo para actualizar
            if (Object.keys(ordenData).length === 0) {
                throw new Error('No hay datos para actualizar');
            }

            // No permitir actualizar cliente, producto, flujo o estado desde este endpoint
            const camposNoPermitidos = ['id_cliente', 'id_producto', 'id_flujo', 'id_estado_actual'];
            const camposInvalidos = camposNoPermitidos.filter(campo => ordenData[campo] !== undefined);

            if (camposInvalidos.length > 0) {
                throw new Error(`No se pueden actualizar los campos: ${camposInvalidos.join(', ')}. Use el endpoint específico para cambiar el estado.`);
            }

            // Actualizar orden
            const ordenActualizada = await this.ordenRepository.update(id, ordenData);

            if (!ordenActualizada) {
                throw new Error('Error al actualizar la orden');
            }

            return {
                data: ordenActualizada,
                message: 'Orden actualizada exitosamente'
            };
        } catch (error) {
            console.error('Error en UpdateOrdenUseCase:', error);
            throw error;
        }
    }
}

module.exports = UpdateOrdenUseCase;
