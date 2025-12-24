const IUseCase = require('../../../domain/usecases/IUseCase');
const FlujoRepository = require('../../../infrastructure/repositories/FlujoRepository');

class ConfigurarEstadosFlujoUseCase extends IUseCase {
    constructor() {
        super();
        this.flujoRepository = new FlujoRepository();
    }

    async execute(idFlujo, estados) {
        try {
            // Verificar que el flujo existe
            const flujoExistente = await this.flujoRepository.findById(idFlujo);
            if (!flujoExistente) {
                throw new Error('Flujo no encontrado');
            }

            // Validar que se proporcionen estados
            if (!estados || !Array.isArray(estados) || estados.length === 0) {
                throw new Error('Debe proporcionar al menos un estado');
            }

            // Configurar estados (el repositorio valida las reglas de negocio)
            await this.flujoRepository.configurarEstados(idFlujo, estados);

            // Obtener el flujo actualizado con sus estados
            const flujoActualizado = await this.flujoRepository.findById(idFlujo);

            return {
                message: 'Estados configurados exitosamente',
                data: flujoActualizado.toJSON()
            };
        } catch (error) {
            console.error('Error en ConfigurarEstadosFlujoUseCase:', error);
            throw new Error('Error al configurar estados del flujo: ' + error.message);
        }
    }
}

module.exports = ConfigurarEstadosFlujoUseCase;
