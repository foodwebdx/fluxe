const IUseCase = require('../../domain/usecases/IUseCase');
const ClienteRepository = require('../../../infrastructure/repositories/ClienteRepository');

class CreateClienteUseCase extends IUseCase {
    constructor() {
        super();
        this.clienteRepository = new ClienteRepository();
    }

    async execute(clienteData) {
        try {
            // Validaciones
            this.validateClienteData(clienteData);

            // Verificar email único
            const clientes = await this.clienteRepository.findAll();
            const emailExiste = clientes.some(
                c => c.correo_electronico.toLowerCase() === clienteData.correo_electronico.toLowerCase()
            );

            if (emailExiste) {
                throw new Error('Ya existe un cliente con ese correo electrónico');
            }

            // Verificar identificación única
            const identificacionExiste = clientes.some(
                c => c.tipo_identificacion === clienteData.tipo_identificacion &&
                    c.numero_identificacion === clienteData.numero_identificacion
            );

            if (identificacionExiste) {
                throw new Error('Ya existe un cliente con esa identificación');
            }

            // Crear cliente
            const nuevoCliente = await this.clienteRepository.create(clienteData);

            return {
                data: nuevoCliente,
                message: 'Cliente creado exitosamente'
            };
        } catch (error) {
            console.error('Error en CreateClienteUseCase:', error);
            throw error;
        }
    }

    validateClienteData(data) {
        const requiredFields = [
            'tipo_identificacion',
            'numero_identificacion',
            'nombre_completo',
            'telefono_contacto',
            'correo_electronico'
        ];

        for (const field of requiredFields) {
            if (!data[field] || data[field].toString().trim() === '') {
                throw new Error(`El campo ${field} es requerido`);
            }
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.correo_electronico)) {
            throw new Error('El formato del correo electrónico no es válido');
        }

        // Validar tipos de identificación permitidos
        const tiposPermitidos = ['CC', 'CE', 'NIT', 'TI', 'PP', 'PEP'];
        if (!tiposPermitidos.includes(data.tipo_identificacion)) {
            throw new Error(`Tipo de identificación no válido. Permitidos: ${tiposPermitidos.join(', ')}`);
        }
    }
}

module.exports = CreateClienteUseCase;
