const IUseCase = require('../../../domain/usecases/IUseCase');
const EstadoRepository = require('../../../infrastructure/repositories/EstadoRepository');
const Estado = require('../../../domain/entities/Estado');

class CreateEstadoUseCase extends IUseCase {
    constructor() {
        super();
        this.estadoRepository = new EstadoRepository();
    }

    async execute(estadoData) {
        try {
            // Crear entidad para validar
            const estado = new Estado(estadoData);

            // Validar entidad
            const errors = estado.validate();
            if (errors.length > 0) {
                throw new Error('Errores de validación: ' + errors.join(', '));
            }

            // Crear en la base de datos
            const nuevoEstado = await this.estadoRepository.create({
                nombre_estado: estadoData.nombre_estado,
                descripcion_estado: estadoData.descripcion_estado
            });

            return {
                data: nuevoEstado.toJSON()
            };
        } catch (error) {
            console.error('Error en CreateEstadoUseCase:', error);
            throw new Error('Error al crear el estado: ' + error.message);
        }
    }
}

module.exports = CreateEstadoUseCase;
