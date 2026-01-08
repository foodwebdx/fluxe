const IUseCase = require('../../../domain/usecases/IUseCase');
const EncuestaRepository = require('../../../infrastructure/repositories/EncuestaRepository');
const OrdenRepository = require('../../../infrastructure/repositories/OrdenRepository');
const Encuesta = require('../../../domain/entities/Encuesta');

class CreateEncuestaUseCase extends IUseCase {
    constructor() {
        super();
        this.encuestaRepository = new EncuestaRepository();
        this.ordenRepository = new OrdenRepository();
    }

    async execute(encuestaData) {
        try {
            const encuesta = new Encuesta(encuestaData);
            const errors = encuesta.validate();
            if (errors.length > 0) {
                throw new Error('Errores de validación: ' + errors.join(', '));
            }

            const orden = await this.ordenRepository.findById(encuestaData.id_orden);
            if (!orden) {
                throw new Error('La orden especificada no existe');
            }

            const existente = await this.encuestaRepository.findByOrden(encuestaData.id_orden);
            if (existente) {
                throw new Error('Ya existe una encuesta para esta orden');
            }

            const nuevaEncuesta = await this.encuestaRepository.create(encuestaData);

            return {
                data: nuevaEncuesta
            };
        } catch (error) {
            console.error('Error en CreateEncuestaUseCase:', error);
            throw new Error('Error al crear la encuesta: ' + error.message);
        }
    }
}

module.exports = CreateEncuestaUseCase;
