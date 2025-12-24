const IUseCase = require('../../../domain/usecases/IUseCase');
const FlujoRepository = require('../../../infrastructure/repositories/FlujoRepository');
const Flujo = require('../../../domain/entities/Flujo');

class CreateFlujoUseCase extends IUseCase {
    constructor() {
        super();
        this.flujoRepository = new FlujoRepository();
    }

    async execute(flujoData) {
        try {
            // Crear entidad para validar
            const flujo = new Flujo(flujoData);

            // Validar entidad
            const errors = flujo.validate();
            if (errors.length > 0) {
                throw new Error('Errores de validación: ' + errors.join(', '));
            }

            // Crear en la base de datos
            const nuevoFlujo = await this.flujoRepository.create({
                nombre_flujo: flujoData.nombre_flujo,
                descripcion_flujo: flujoData.descripcion_flujo,
                activo: flujoData.activo
            });

            return {
                data: nuevoFlujo.toJSON()
            };
        } catch (error) {
            console.error('Error en CreateFlujoUseCase:', error);
            throw new Error('Error al crear el flujo: ' + error.message);
        }
    }
}

module.exports = CreateFlujoUseCase;
