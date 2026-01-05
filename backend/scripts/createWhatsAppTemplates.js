import WhatsAppService from '../infrastructure/services/WhatsAppService.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Script para crear templates de WhatsApp en KAPSO
 * Ejecutar con: node backend/scripts/createWhatsAppTemplates.js
 */

const templates = [
    {
        name: 'cambio_estado_orden',
        category: 'UTILITY',
        language: 'es_MX',
        parameterFormat: 'NAMED',
        components: [
            {
                type: 'BODY',
                text: 'Hola {{cliente_nombre}}, tu orden {{orden_numero}} cambió al estado {{nuevo_estado}}. Te mantendremos informado.',
                example: {
                    body_text_named_params: [
                        { param_name: 'cliente_nombre', example: 'Juan Pérez' },
                        { param_name: 'orden_numero', example: '#123' },
                        { param_name: 'nuevo_estado', example: 'En Proceso' }
                    ]
                }
            }
        ]
    },
    {
        name: 'orden_creada',
        category: 'UTILITY',
        language: 'es_MX',
        parameterFormat: 'NAMED',
        components: [
            {
                type: 'BODY',
                text: '¡Hola {{cliente_nombre}}! Tu orden {{orden_numero}} ha sido creada exitosamente. Te mantendremos informado sobre su progreso.',
                example: {
                    body_text_named_params: [
                        { param_name: 'cliente_nombre', example: 'Juan Pérez' },
                        { param_name: 'orden_numero', example: '#123' }
                    ]
                }
            }
        ]
    },
    {
        name: 'orden_completada',
        category: 'UTILITY',
        language: 'es_MX',
        parameterFormat: 'NAMED',
        components: [
            {
                type: 'BODY',
                text: '¡Excelente noticia {{cliente_nombre}}! Tu orden {{orden_numero}} ha sido completada. Gracias por confiar en nosotros.',
                example: {
                    body_text_named_params: [
                        { param_name: 'cliente_nombre', example: 'Juan Pérez' },
                        { param_name: 'orden_numero', example: '#123' }
                    ]
                }
            }
        ]
    },
    {
        name: 'orden_en_proceso',
        category: 'UTILITY',
        language: 'es_MX',
        parameterFormat: 'NAMED',
        components: [
            {
                type: 'BODY',
                text: 'Hola {{cliente_nombre}}, tu orden {{orden_numero}} está en proceso. Fecha estimada de entrega: {{fecha_estimada}}. Gracias por tu paciencia.',
                example: {
                    body_text_named_params: [
                        { param_name: 'cliente_nombre', example: 'Juan Pérez' },
                        { param_name: 'orden_numero', example: '#123' },
                        { param_name: 'fecha_estimada', example: '15/01/2026' }
                    ]
                }
            }
        ]
    }
];

async function createTemplates() {
    console.log('🚀 Iniciando creación de templates de WhatsApp...\n');

    if (!WhatsAppService.isConfigured()) {
        console.error('❌ Error: WhatsApp Service no está configurado correctamente');
        console.error('Verifica las variables de entorno:');
        console.error('- KAPSO_API_KEY');
        console.error('- KAPSO_PHONE_NUMBER_ID');
        console.error('- KAPSO_BUSINESS_ACCOUNT_ID');
        console.error('- WHATSAPP_NOTIFICATIONS_ENABLED');
        process.exit(1);
    }

    console.log('✅ Configuración verificada');
    console.log(`📱 Business Account ID: ${WhatsAppService.businessAccountId}`);
    console.log(`📞 Phone Number ID: ${WhatsAppService.phoneNumberId}\n`);

    const results = [];

    for (const template of templates) {
        console.log(`📝 Creando template: ${template.name}...`);

        try {
            const result = await WhatsAppService.createTemplate(template);

            if (result.success) {
                console.log(`✅ Template "${template.name}" creado exitosamente`);
                results.push({ name: template.name, status: 'success' });
            } else {
                console.error(`❌ Error creando template "${template.name}": ${result.error}`);
                results.push({ name: template.name, status: 'error', error: result.error });
            }
        } catch (error) {
            console.error(`❌ Error inesperado con template "${template.name}":`, error.message);
            results.push({ name: template.name, status: 'error', error: error.message });
        }

        console.log(''); // Línea en blanco para separar
    }

    // Resumen
    console.log('\n📊 RESUMEN DE CREACIÓN DE TEMPLATES');
    console.log('=====================================');

    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'error').length;

    console.log(`✅ Exitosos: ${successful}`);
    console.log(`❌ Fallidos: ${failed}`);
    console.log(`📝 Total: ${results.length}\n`);

    if (failed > 0) {
        console.log('Templates con errores:');
        results
            .filter(r => r.status === 'error')
            .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
        console.log('');
    }

    console.log('⏳ IMPORTANTE: Los templates deben ser aprobados por Meta');
    console.log('   Este proceso puede tomar 24-48 horas.');
    console.log('   Verifica el estado en el dashboard de KAPSO o Meta Business Manager.\n');

    process.exit(failed > 0 ? 1 : 0);
}

// Ejecutar script
createTemplates().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
});
