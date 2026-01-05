import dotenv from 'dotenv';
import WhatsAppService from '../infrastructure/services/WhatsAppService.js';

// Cargar variables de entorno
dotenv.config();

console.log('\n📱 PRUEBA DE ENVÍO DE TEMPLATE WHATSAPP\n');
console.log('==========================================\n');

async function testSendTemplate() {
    // Verificar configuración
    if (!WhatsAppService.isConfigured()) {
        console.error('❌ Servicio no configurado');
        process.exit(1);
    }

    console.log('✅ Servicio configurado correctamente');
    console.log(`📞 Enviando template a: +573196695353\n`);

    try {
        // Probar con el template "cambio_estado_orden" que acabamos de crear
        const result = await WhatsAppService.sendTemplate(
            '+573196695353',
            'cambio_estado_orden',
            [
                { type: 'text', parameterName: 'cliente_nombre', text: 'Santiago' },
                { type: 'text', parameterName: 'orden_numero', text: '#001' },
                { type: 'text', parameterName: 'nuevo_estado', text: 'En Proceso' }
            ]
        );

        console.log('📊 Resultado del envío:');
        console.log(JSON.stringify(result, null, 2));

        if (result.sent) {
            console.log('\n✅ ¡Template enviado exitosamente!');
            console.log(`📬 Message ID: ${result.messageId}`);
            console.log('\n🔍 Verifica tu WhatsApp (+57 319 6695353) para confirmar la recepción del mensaje.\n');
            console.log('💡 El mensaje debería decir:');
            console.log('   "Hola Santiago, tu orden #001 cambió al estado En Proceso. Te mantendremos informado."\n');
        } else {
            console.log('\n❌ No se pudo enviar el template');
            console.log(`Razón: ${result.reason || result.error}\n`);

            if (result.error && result.error.includes('template')) {
                console.log('💡 Posibles causas:');
                console.log('   - El template no ha sido aprobado por Meta (espera 24-48h)');
                console.log('   - El nombre del template es incorrecto');
                console.log('   - El template no existe en tu cuenta\n');
            }
        }
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

testSendTemplate();
