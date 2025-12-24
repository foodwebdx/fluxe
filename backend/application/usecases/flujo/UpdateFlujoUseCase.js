const IUseCase = require('../../../domain/usecases/IUseCase');
const FlujoRepository = require('../../../infrastructure/repositories/FlujoRepository');

class UpdateFlujoUseCase extends IUseCase {
    constructor() {
        super();
        this.flujoRepository = new FlujoRepository();
    }

    async execute(id, flujoData) {
        try {
            // Verificar que el flujo existe
            const flujoExistente = await this.flujoRepository.findById(id);
            if (!flujoExistente) {
                throw new Error('Flujo no encontrado');
            }

            // Actualizar
            const flujoActualizado = await this.flujoRepository.update(id, flujoData);

            if (!flujoActualizado) {
                throw new Error('No se pudo actualizar el flujo');
            }

            return {
                data: flujoActualizado.toJSON()
            };
        } catch (error) {
            console.error('Error en UpdateFlujoUseCase:', error);
            throw new Error('Error al actualizar el flujo: ' + error.message);
        }
    }
}

module.exports = UpdateFlujoUseCase;
