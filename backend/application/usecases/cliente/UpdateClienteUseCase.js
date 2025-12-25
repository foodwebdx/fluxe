const IUseCase = require('../../../domain/usecases/IUseCase');
const ClienteRepository = require('../../../infrastructure/repositories/ClienteRepository');

class UpdateClienteUseCase extends IUseCase {
    constructor() {
        super();
        this.clienteRepository = new ClienteRepository();
    }

    async execute(id, clienteData) {
        try {
            // Verificar que el cliente existe
            const clienteExistente = await this.clienteRepository.findById(id);
            if (!clienteExistente) {
                throw new Error('Cliente no encontrado');
            }

            // Validar datos si se proporcionan
            if (clienteData.correo_electronico) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(clienteData.correo_electronico)) {
                    throw new Error('El formato del correo electrónico no es válido');
                }

                // Verificar email único (excepto el mismo cliente)
                const clientes = await this.clienteRepository.findAll();
                const emailExiste = clientes.some(
                    c => c.id_cliente !== parseInt(id) &&
                        c.correo_electronico.toLowerCase() === clienteData.correo_electronico.toLowerCase()
                );

                if (emailExiste) {
                    throw new Error('Ya existe otro cliente con ese correo electrónico');
                }
            }

            // Verificar identificación única si se actualiza
            if (clienteData.tipo_identificacion || clienteData.numero_identificacion) {
                const tipoId = clienteData.tipo_identificacion || clienteExistente.tipo_identificacion;
                const numeroId = clienteData.numero_identificacion || clienteExistente.numero_identificacion;

                const clientes = await this.clienteRepository.findAll();
                const identificacionExiste = clientes.some(
                    c => c.id_cliente !== parseInt(id) &&
                        c.tipo_identificacion === tipoId &&
                        c.numero_identificacion === numeroId
                );

                if (identificacionExiste) {
                    throw new Error('Ya existe otro cliente con esa identificación');
                }
            }

            // Validar tipo de identificación si se proporciona
            if (clienteData.tipo_identificacion) {
                const tiposPermitidos = ['CC', 'CE', 'NIT', 'TI', 'PP', 'PEP'];
                if (!tiposPermitidos.includes(clienteData.tipo_identificacion)) {
                    throw new Error(`Tipo de identificación no válido. Permitidos: ${tiposPermitidos.join(', ')}`);
                }
            }

            // Actualizar cliente
            const clienteActualizado = await this.clienteRepository.update(id, clienteData);

            if (!clienteActualizado) {
                throw new Error('Error al actualizar el cliente');
            }

            return {
                data: clienteActualizado,
                message: 'Cliente actualizado exitosamente'
            };
        } catch (error) {
            console.error('Error en UpdateClienteUseCase:', error);
            throw error;
        }
    }
}

module.exports = UpdateClienteUseCase;
