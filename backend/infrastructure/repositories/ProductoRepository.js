const IProductoRepository = require('../../domain/repositories/IProductoRepository');
const Producto = require('../../domain/entities/Producto');
const { getPrisma } = require('../database/db');

class ProductoRepository extends IProductoRepository {
    constructor() {
        super();
    }

    getPrisma() {
        const prisma = getPrisma();
        if (!prisma) {
            throw new Error('Prisma no está conectado. Asegúrate de que el servidor se haya iniciado correctamente.');
        }
        return prisma;
    }

    async findById(id) {
        try {
            const producto = await this.getPrisma().productos.findUnique({
                where: { id_producto: parseInt(id) },
                include: {
                    clientes: {
                        select: {
                            id_cliente: true,
                            nombre_completo: true,
                            correo_electronico: true,
                            telefono_contacto: true
                        }
                    }
                }
            });

            if (!producto) {
                return null;
            }

            return new Producto(producto);
        } catch (error) {
            console.error('Error en findById:', error);
            throw error;
        }
    }

    async findAll() {
        try {
            const productos = await this.getPrisma().productos.findMany({
                include: {
                    clientes: {
                        select: {
                            id_cliente: true,
                            nombre_completo: true,
                            correo_electronico: true,
                            telefono_contacto: true
                        }
                    }
                },
                orderBy: { id_producto: 'desc' }
            });

            return productos.map(producto => new Producto(producto));
        } catch (error) {
            console.error('Error en findAll:', error);
            throw error;
        }
    }

    async findByCliente(idCliente) {
        try {
            const productos = await this.getPrisma().productos.findMany({
                where: { id_cliente: parseInt(idCliente) },
                include: {
                    clientes: {
                        select: {
                            id_cliente: true,
                            nombre_completo: true,
                            correo_electronico: true,
                            telefono_contacto: true
                        }
                    }
                },
                orderBy: { id_producto: 'desc' }
            });

            return productos.map(producto => new Producto(producto));
        } catch (error) {
            console.error('Error en findByCliente:', error);
            throw error;
        }
    }

    async create(producto) {
        try {
            const nuevoProducto = await this.getPrisma().productos.create({
                data: {
                    id_cliente: parseInt(producto.id_cliente),
                    nombre_producto: producto.nombre_producto,
                    identificador_interno: producto.identificador_interno || null,
                    descripcion: producto.descripcion || null,
                    modelo: producto.modelo || null,
                    numero_serie: producto.numero_serie || null,
                    identificador_unico_adicional: producto.identificador_unico_adicional || null,
                    notas_producto: producto.notas_producto || null
                },
                include: {
                    clientes: {
                        select: {
                            id_cliente: true,
                            nombre_completo: true,
                            correo_electronico: true,
                            telefono_contacto: true
                        }
                    }
                }
            });

            return new Producto(nuevoProducto);
        } catch (error) {
            console.error('Error en create:', error);
            throw error;
        }
    }

    async update(id, productoData) {
        try {
            const dataToUpdate = {};

            const allowedFields = [
                'nombre_producto',
                'identificador_interno',
                'descripcion',
                'modelo',
                'numero_serie',
                'identificador_unico_adicional',
                'notas_producto'
            ];

            allowedFields.forEach(field => {
                if (productoData[field] !== undefined) {
                    dataToUpdate[field] = productoData[field];
                }
            });

            if (Object.keys(dataToUpdate).length === 0) {
                throw new Error('No hay campos para actualizar');
            }

            const productoActualizado = await this.getPrisma().productos.update({
                where: { id_producto: parseInt(id) },
                data: dataToUpdate,
                include: {
                    clientes: {
                        select: {
                            id_cliente: true,
                            nombre_completo: true,
                            correo_electronico: true,
                            telefono_contacto: true
                        }
                    }
                }
            });

            return new Producto(productoActualizado);
        } catch (error) {
            if (error.code === 'P2025') {
                return null;
            }
            console.error('Error en update:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            await this.getPrisma().productos.delete({
                where: { id_producto: parseInt(id) }
            });

            return true;
        } catch (error) {
            if (error.code === 'P2025') {
                return false;
            }
            console.error('Error en delete:', error);
            throw error;
        }
    }
}

module.exports = ProductoRepository;
