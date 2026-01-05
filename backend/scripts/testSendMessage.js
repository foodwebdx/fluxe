import dotenv from 'dotenv';
import WhatsAppService from '../infrastructure/services/WhatsAppService.js';

// Cargar variables de entorno
dotenv.config();

console.log('\n📱 PRUEBA DE ENVÍO DE MENSAJE WHATSAPP\n');
console.log('==========================================\n');

async function testSendMessage() {
    // Verificar configuración
    if (!WhatsAppService.isConfigured()) {
        console.error('❌ Servicio no configurado');
        process.exit(1);
    }

    console.log('✅ Servicio configurado correctamente');
    console.log(`📞 Enviando mensaje a: +573166651673\n`);

    try {
        const result = await WhatsAppService.sendTextMessage(
            '+573166651673',
            '¡Hola! Este es un mensaje de prueba desde Fluxe 🚀'
        );

        console.log('📊 Resultado del envío:');
        console.log(JSON.stringify(result, null, 2));

        if (result.sent) {
            console.log('\n✅ ¡Mensaje enviado exitosamente!');
            console.log(`📬 Message ID: ${result.messageId}`);
            console.log('\n🔍 Verifica tu WhatsApp para confirmar la recepción del mensaje.\n');
        } else {
            console.log('\n❌ No se pudo enviar el mensaje');
            console.log(`Razón: ${result.reason || result.error}\n`);
        }
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

testSendMessage();
