const IUseCase = require('../../../domain/usecases/IUseCase');
const OrdenRepository = require('../../../infrastructure/repositories/OrdenRepository');
const ClienteRepository = require('../../../infrastructure/repositories/ClienteRepository');
const ProductoRepository = require('../../../infrastructure/repositories/ProductoRepository');
const FlujoRepository = require('../../../infrastructure/repositories/FlujoRepository');
const HistorialEstadoRepository = require('../../../infrastructure/repositories/HistorialEstadoRepository');
const CreateProductoUseCase = require('../producto/CreateProductoUseCase');
const WhatsAppService = require('../../../infrastructure/services/WhatsAppService').default;

class CreateOrdenUseCase extends IUseCase {
    constructor() {
        super();
        this.ordenRepository = new OrdenRepository();
        this.clienteRepository = new ClienteRepository();
        this.productoRepository = new ProductoRepository();
        this.flujoRepository = new FlujoRepository();
        this.historialRepository = new HistorialEstadoRepository();
        this.createProductoUseCase = new CreateProductoUseCase();
    }

    async execute(ordenData) {
        try {
            // 1. Validar datos básicos
            this.validateOrdenData(ordenData);

            // 2. Validar/Crear Cliente
            let clienteId = ordenData.id_cliente;
            if (ordenData.cliente && !clienteId) {
                // Crear nuevo cliente
                const nuevoCliente = await this.clienteRepository.create(ordenData.cliente);
                clienteId = nuevoCliente.id_cliente;
            } else if (clienteId) {
                // Verificar que el cliente existe
                const cliente = await this.clienteRepository.findById(clienteId);
                if (!cliente) {
                    throw new Error('El cliente especificado no existe');
                }
            } else {
                throw new Error('Debe proporcionar un id_cliente o datos del cliente');
            }

            // 3. Validar/Crear Producto
            let productoId = ordenData.id_producto;
            if (ordenData.producto && !productoId) {
                // Crear nuevo producto asociado al cliente usando el use case
                // para que se genere automáticamente el identificador_interno
                const resultado = await this.createProductoUseCase.execute({
                    ...ordenData.producto,
                    id_cliente: clienteId
                });
                productoId = resultado.data.id_producto;
            } else if (productoId) {
                // Verificar que el producto existe
                const producto = await this.productoRepository.findById(productoId);
                if (!producto) {
                    throw new Error('El producto especificado no existe');
                }
                // Verificar que el producto pertenece al cliente
                if (producto.id_cliente !== clienteId) {
                    throw new Error('El producto no pertenece al cliente especificado');
                }
            } else {
                throw new Error('Debe proporcionar un id_producto o datos del producto');
            }

            // 4. Validar Flujo y obtener estado inicial
            const flujoId = ordenData.id_flujo;
            if (!flujoId) {
                throw new Error('El id_flujo es requerido');
            }

            const flujo = await this.flujoRepository.findById(flujoId);
            if (!flujo) {
                throw new Error('El flujo especificado no existe');
            }

            if (!flujo.activo) {
                throw new Error('El flujo especificado no está activo');
            }

            // Obtener estados del flujo
            const estadosFlujo = await this.flujoRepository.getEstadosFlujo(flujoId);
            if (!estadosFlujo || estadosFlujo.length === 0) {
                throw new Error('El flujo no tiene estados configurados');
            }

            // El estado inicial es el primero del flujo (posición 1)
            const estadoInicial = estadosFlujo.find(e => e.posicion === 1);
            if (!estadoInicial) {
                throw new Error('No se encontró el estado inicial del flujo');
            }

            // 5. Crear la orden
            const nuevaOrden = await this.ordenRepository.create({
                id_cliente: clienteId,
                id_producto: productoId,
                id_flujo: flujoId,
                id_estado_actual: estadoInicial.id_estado,
                descripcion_servicio: ordenData.descripcion_servicio,
                condiciones_pago: ordenData.condiciones_pago,
                fecha_estimada_entrega: ordenData.fecha_estimada_entrega,
                notas_orden: ordenData.notas_orden
            });

            // 6. Registrar en historial de estados
            await this.historialRepository.create({
                id_orden: nuevaOrden.id_orden,
                id_estado: estadoInicial.id_estado,
                id_usuario_responsable: ordenData.id_usuario_responsable || 1,
                fecha_hora_cambio: new Date()
            });

            // 7. Obtener la orden completa con todas las relaciones
            const ordenCompleta = await this.ordenRepository.findById(nuevaOrden.id_orden);

            // 8. Enviar notificación de WhatsApp (sin bloquear el flujo)
            this.enviarNotificacionOrdenCreada(ordenCompleta, clienteId).catch(error => {
                console.error('Error enviando notificación WhatsApp (no crítico):', error);
            });

            return {
                data: ordenCompleta,
                message: 'Orden creada exitosamente',
                cliente_creado: ordenData.cliente && !ordenData.id_cliente,
                producto_creado: ordenData.producto && !ordenData.id_producto
            };
        } catch (error) {
            console.error('Error en CreateOrdenUseCase:', error);
            throw error;
        }
    }

    validateOrdenData(data) {
        if (!data.descripcion_servicio || data.descripcion_servicio.trim() === '') {
            throw new Error('La descripción del servicio es requerida');
        }

        if (!data.id_flujo) {
            throw new Error('El id_flujo es requerido');
        }

        // Validar que tenga cliente o datos de cliente
        if (!data.id_cliente && !data.cliente) {
            throw new Error('Debe proporcionar id_cliente o datos del cliente');
        }

        // Validar que tenga producto o datos de producto
        if (!data.id_producto && !data.producto) {
            throw new Error('Debe proporcionar id_producto o datos del producto');
        }
    }

    /**
     * Envía notificación de WhatsApp al cliente cuando se crea una orden
     * Este método es asíncrono y no bloquea el flujo principal
     */
    async enviarNotificacionOrdenCreada(orden, clienteId) {
        try {
            // Obtener datos del cliente
            const cliente = await this.clienteRepository.findById(clienteId);

            if (!cliente) {
                console.log('Cliente no encontrado para notificación WhatsApp');
                return;
            }

            // Enviar notificación usando el template orden_creada
            const resultado = await WhatsAppService.sendTemplate(
                cliente.telefono_contacto,
                'orden_creada',
                [
                    { type: 'text', parameterName: 'cliente_nombre', text: cliente.nombre_completo },
                    { type: 'text', parameterName: 'orden_numero', text: `#${orden.id_orden}` }
                ]
            );

            if (resultado.sent) {
                console.log(`✅ Notificación de orden creada enviada a ${cliente.nombre_completo} (${cliente.telefono_contacto})`);
            } else {
                console.log(`⚠️ No se envió notificación de orden creada: ${resultado.reason || resultado.error}`);
            }
        } catch (error) {
            // No lanzar error para no afectar el flujo principal
            console.error('Error en enviarNotificacionOrdenCreada:', error.message);
        }
    }
}

module.exports = CreateOrdenUseCase;
