import dotenv from 'dotenv';
import WhatsAppService from '../infrastructure/services/WhatsAppService.js';

// Cargar variables de entorno
dotenv.config();

/**
 * Script para crear el template de bienvenida automática
 * Ejecutar con: node backend/scripts/createWelcomeTemplate.js
 */

const welcomeTemplate = {
    name: 'orden_seguimiento',
    category: 'UTILITY',
    language: 'es_MX',
    parameterFormat: 'NAMED',
    components: [
        {
            type: 'BODY',
            text: 'Hola, en este momento estamos trabajando en tu orden. En este link {{link}} podrás ver comentarios, evidencias y el flujo de cómo va la orden. Cualquier actualización que se realice te la enviaremos por este canal.',
            example: {
                body_text_named_params: [
                    {
                        param_name: 'link',
                        example: 'https://fluxe.app/seguimiento/ABC123'
                    }
                ]
            }
        }
    ]
};

async function createWelcomeTemplate() {
    console.log('\n🚀 Creando Template de Bienvenida Automática\n');
    console.log('==========================================\n');

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

    console.log(`📝 Creando template: ${welcomeTemplate.name}...`);
    console.log(`📄 Texto del template:`);
    console.log(`   "${welcomeTemplate.components[0].text}"\n`);

    try {
        const result = await WhatsAppService.createTemplate(welcomeTemplate);

        if (result.success) {
            console.log(`✅ Template "${welcomeTemplate.name}" creado exitosamente\n`);
            console.log('📊 RESUMEN');
            console.log('=====================================');
            console.log('✅ Template creado: orden_seguimiento');
            console.log('⏳ Estado: Pendiente de aprobación por Meta');
            console.log('🕐 Tiempo estimado: 24-48 horas\n');

            console.log('📝 PRÓXIMOS PASOS:');
            console.log('1. Esperar aprobación de Meta (24-48 horas)');
            console.log('2. Configurar workflow en dashboard de KAPSO:');
            console.log('   - Ir a https://app.kapso.ai');
            console.log('   - Crear nuevo Workflow');
            console.log('   - Trigger: WhatsApp Message');
            console.log('   - Step: Send Template "orden_seguimiento"');
            console.log('3. Probar enviando un mensaje al número de WhatsApp');
            console.log('4. Verificar que recibes la respuesta automática\n');

            console.log('💡 NOTA: El link es un placeholder por ahora.');
            console.log('   Más adelante se implementará la página de seguimiento.\n');

            process.exit(0);
        } else {
            console.error(`❌ Error creando template: ${result.error}\n`);

            if (result.error && result.error.includes('already exists')) {
                console.log('ℹ️  El template ya existe en tu cuenta.');
                console.log('   Puedes proceder a configurar el workflow en KAPSO.\n');
                process.exit(0);
            }

            process.exit(1);
        }
    } catch (error) {
        console.error('\n❌ Error inesperado:', error.message);
        process.exit(1);
    }
}

// Ejecutar script
createWelcomeTemplate();
