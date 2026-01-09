const { getPrisma } = require('../database/db');

const normalizeDirection = (direction) => {
    if (!direction) return null;
    const value = String(direction).trim().toLowerCase();
    if (value === 'inbound' || value === 'outbound') {
        return value;
    }
    return null;
};

class WhatsAppMensajeRepository {
    getPrisma() {
        const prisma = getPrisma();
        if (!prisma) {
            throw new Error('Prisma no está conectado. Asegúrate de que el servidor se haya iniciado correctamente.');
        }
        return prisma;
    }

    async create(data) {
        try {
            const direction = normalizeDirection(data.direction);
            if (!direction) {
                throw new Error('Direction invalida. Use inbound u outbound.');
            }

            const payload = {
                id_orden: parseInt(data.id_orden),
                message_id: data.message_id,
                direction,
                phone_number: data.phone_number,
                conversation_id: data.conversation_id || null,
                message_type: data.message_type,
                body: data.body || null
            };

            if (data.created_at) {
                payload.created_at = data.created_at;
            }

            return await this.getPrisma().whatsapp_mensajes.create({
                data: payload
            });
        } catch (error) {
            console.error('Error en create WhatsApp mensaje:', error);
            throw error;
        }
    }

    async findLastOutboundByPhone(phoneNumber) {
        try {
            return await this.getPrisma().whatsapp_mensajes.findFirst({
                where: {
                    phone_number: phoneNumber,
                    direction: 'outbound'
                },
                orderBy: { created_at: 'desc' }
            });
        } catch (error) {
            console.error('Error en findLastOutboundByPhone:', error);
            throw error;
        }
    }

    async findLastOutboundByPhoneAndContextPrefix(phoneNumber, prefix) {
        try {
            return await this.getPrisma().whatsapp_mensajes.findFirst({
                where: {
                    phone_number: phoneNumber,
                    direction: 'outbound',
                    conversation_id: {
                        startsWith: prefix
                    }
                },
                orderBy: { created_at: 'desc' }
            });
        } catch (error) {
            console.error('Error en findLastOutboundByPhoneAndContextPrefix:', error);
            throw error;
        }
    }

    async findFirstInboundByContext(contextId) {
        try {
            return await this.getPrisma().whatsapp_mensajes.findFirst({
                where: {
                    direction: 'inbound',
                    conversation_id: contextId
                },
                orderBy: { created_at: 'asc' }
            });
        } catch (error) {
            console.error('Error en findFirstInboundByContext:', error);
            throw error;
        }
    }

    async findByOrden(idOrden) {
        try {
            return await this.getPrisma().whatsapp_mensajes.findMany({
                where: { id_orden: parseInt(idOrden) },
                orderBy: { created_at: 'asc' }
            });
        } catch (error) {
            console.error('Error en findByOrden:', error);
            throw error;
        }
    }

    async deleteByOrden(idOrden) {
        try {
            return await this.getPrisma().whatsapp_mensajes.deleteMany({
                where: { id_orden: parseInt(idOrden) }
            });
        } catch (error) {
            console.error('Error en deleteByOrden:', error);
            throw error;
        }
    }

    async deleteById(idMensaje) {
        try {
            return await this.getPrisma().whatsapp_mensajes.delete({
                where: { id_mensaje: parseInt(idMensaje) }
            });
        } catch (error) {
            console.error('Error en deleteById:', error);
            throw error;
        }
    }

    async updateMessageId(idMensaje, messageId) {
        try {
            return await this.getPrisma().whatsapp_mensajes.update({
                where: { id_mensaje: parseInt(idMensaje) },
                data: { message_id: messageId }
            });
        } catch (error) {
            console.error('Error en updateMessageId:', error);
            throw error;
        }
    }

    async findFirstInboundByOrdenSince(idOrden, sinceDate) {
        try {
            const where = {
                id_orden: parseInt(idOrden),
                direction: 'inbound'
            };

            if (sinceDate) {
                where.created_at = { gte: sinceDate };
            }

            return await this.getPrisma().whatsapp_mensajes.findFirst({
                where,
                orderBy: { created_at: 'asc' }
            });
        } catch (error) {
            console.error('Error en findFirstInboundByOrdenSince:', error);
            throw error;
        }
    }

    async findLatestInboundByOrden(idOrden, { excludeContextPrefix } = {}) {
        try {
            const where = {
                id_orden: parseInt(idOrden),
                direction: 'inbound'
            };

            if (excludeContextPrefix) {
                where.NOT = {
                    conversation_id: {
                        startsWith: excludeContextPrefix
                    }
                };
            }

            return await this.getPrisma().whatsapp_mensajes.findFirst({
                where,
                orderBy: { created_at: 'desc' }
            });
        } catch (error) {
            console.error('Error en findLatestInboundByOrden:', error);
            throw error;
        }
    }

    async findAll({ phoneNumber, direction, limit } = {}) {
        try {
            const where = {};
            if (phoneNumber) {
                where.phone_number = phoneNumber;
            }
            const normalized = normalizeDirection(direction);
            if (normalized) {
                where.direction = normalized;
            }

            return await this.getPrisma().whatsapp_mensajes.findMany({
                where,
                orderBy: { created_at: 'desc' },
                ...(limit ? { take: parseInt(limit) } : {})
            });
        } catch (error) {
            console.error('Error en findAll WhatsApp mensajes:', error);
            throw error;
        }
    }
}

module.exports = WhatsAppMensajeRepository;
