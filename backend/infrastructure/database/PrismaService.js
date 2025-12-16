const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

class PrismaService {
    constructor() {
        this.prisma = null;
        this.pool = null;
    }

    async connect() {
        try {
            if (!this.prisma) {
                // Create a PostgreSQL connection pool
                this.pool = new Pool({
                    connectionString: process.env.DATABASE_URL,
                });

                // Create the Prisma PG adapter
                const adapter = new PrismaPg(this.pool);

                // Create Prisma Client with the adapter
                this.prisma = new PrismaClient({
                    adapter,
                    log: process.env.NODE_ENV === 'development'
                        ? ['query', 'info', 'warn', 'error']
                        : ['error'],
                });

                await this.prisma.$connect();
                console.log('✅ Conectado a PostgreSQL (Neon) usando Prisma ORM');

                // Ejecutar una query simple para verificar
                const result = await this.prisma.$queryRaw`SELECT NOW()`;
                console.log('📅 Hora del servidor:', result[0].now);
            }

            return this.prisma;
        } catch (error) {
            console.error('❌ Error al conectar a la base de datos con Prisma:', error.message);
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.prisma) {
                await this.prisma.$disconnect();
                this.prisma = null;
            }
            if (this.pool) {
                await this.pool.end();
                this.pool = null;
            }
            console.log('✅ Desconectado de PostgreSQL (Prisma)');
        } catch (error) {
            console.error('❌ Error al desconectar de la base de datos:', error.message);
            throw error;
        }
    }

    getClient() {
        if (!this.prisma) {
            throw new Error('Prisma no está conectado. Asegúrate de llamar a connect() primero.');
        }
        return this.prisma;
    }

    // Método helper para verificar conexión
    async healthCheck() {
        try {
            if (!this.prisma) {
                return false;
            }
            await this.prisma.$queryRaw`SELECT 1`;
            return true;
        } catch (error) {
            return false;
        }
    }
}

module.exports = PrismaService;
