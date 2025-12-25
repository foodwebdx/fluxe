const IUseCase = require('../../../domain/usecases/IUseCase');
const OrdenRepository = require('../../../infrastructure/repositories/OrdenRepository');
const FlujoRepository = require('../../../infrastructure/repositories/FlujoRepository');
const HistorialEstadoRepository = require('../../../infrastructure/repositories/HistorialEstadoRepository');

class CambiarEstadoOrdenUseCase extends IUseCase {
    constructor() {
        super();
        this.ordenRepository = new OrdenRepository();
        this.flujoRepository = new FlujoRepository();
        this.historialRepository = new HistorialEstadoRepository();
    }

    async execute(idOrden, nuevoEstadoId, usuarioId = 1) {
        try {
            // 1. Obtener orden actual
            const orden = await this.ordenRepository.findById(idOrden);
            if (!orden) {
                throw new Error('Orden no encontrada');
            }

            // 2. Verificar que no sea el mismo estado
            if (orden.id_estado_actual === parseInt(nuevoEstadoId)) {
                throw new Error('La orden ya se encuentra en ese estado');
            }

            // 3. Obtener flujo y sus estados
            const estadosFlujo = await this.flujoRepository.getEstadosFlujo(orden.id_flujo);
            if (!estadosFlujo || estadosFlujo.length === 0) {
                throw new Error('El flujo no tiene estados configurados');
            }

            // 4. Validar que el nuevo estado pertenece al flujo
            const nuevoEstado = estadosFlujo.find(e => e.id_estado === parseInt(nuevoEstadoId));
            if (!nuevoEstado) {
                throw new Error('El estado especificado no pertenece al flujo de esta orden');
            }

            // 5. Obtener posiciones de estados
            const estadoActual = estadosFlujo.find(e => e.id_estado === orden.id_estado_actual);
            if (!estadoActual) {
                throw new Error('Estado actual no encontrado en el flujo');
            }

            const estadoActualPos = estadoActual.posicion;
            const nuevoEstadoPos = nuevoEstado.posicion;

            // 6. Validar transición de estado
            // Permitir avanzar o retroceder, pero validar estados obligatorios al avanzar
            if (nuevoEstadoPos > estadoActualPos) {
                // Avanzando: verificar que no se salten estados obligatorios
                const estadosIntermedios = estadosFlujo.filter(
                    e => e.posicion > estadoActualPos &&
                        e.posicion < nuevoEstadoPos &&
                        e.obligatorio
                );

                if (estadosIntermedios.length > 0) {
                    const nombresEstados = estadosIntermedios.map(e => e.estados?.nombre_estado || 'Estado').join(', ');
                    throw new Error(`No se pueden saltar los siguientes estados obligatorios: ${nombresEstados}`);
                }
            }
            // Si retrocede (nuevoEstadoPos < estadoActualPos), se permite sin restricciones

            // 7. Actualizar estado de la orden
            await this.ordenRepository.cambiarEstado(idOrden, nuevoEstadoId);

            // 8. Registrar en historial
            await this.historialRepository.create({
                id_orden: idOrden,
                id_estado: nuevoEstadoId,
                id_usuario_responsable: usuarioId,
                fecha_hora_cambio: new Date()
            });

            // 9. Si es el último estado del flujo, cerrar la orden
            const ultimoEstado = estadosFlujo[estadosFlujo.length - 1];
            if (nuevoEstadoId === ultimoEstado.id_estado) {
                await this.ordenRepository.update(idOrden, {
                    fecha_cierre: new Date()
                });
            }

            // 10. Obtener orden actualizada
            const ordenActualizada = await this.ordenRepository.findById(idOrden);

            return {
                data: ordenActualizada,
                message: 'Estado de la orden actualizado exitosamente',
                estado_anterior: {
                    id_estado: estadoActual.id_estado,
                    nombre_estado: estadoActual.estados?.nombre_estado,
                    posicion: estadoActualPos
                },
                estado_nuevo: {
                    id_estado: nuevoEstado.id_estado,
                    nombre_estado: nuevoEstado.estados?.nombre_estado,
                    posicion: nuevoEstadoPos
                }
            };
        } catch (error) {
            console.error('Error en CambiarEstadoOrdenUseCase:', error);
            throw error;
        }
    }
}

module.exports = CambiarEstadoOrdenUseCase;
