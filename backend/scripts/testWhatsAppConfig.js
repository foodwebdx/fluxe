import dotenv from 'dotenv';
import WhatsAppService from '../infrastructure/services/WhatsAppService.js';

// Cargar variables de entorno
dotenv.config();

console.log('\n🔍 VERIFICACIÓN DE CONFIGURACIÓN WHATSAPP\n');
console.log('==========================================\n');

// Verificar variables de entorno
console.log('📋 Variables de Entorno:');
console.log('  KAPSO_API_KEY:', process.env.KAPSO_API_KEY ? '✅ Configurada' : '❌ No configurada');
console.log('  KAPSO_BASE_URL:', process.env.KAPSO_BASE_URL || '❌ No configurada');
console.log('  KAPSO_PHONE_NUMBER_ID:', process.env.KAPSO_PHONE_NUMBER_ID || '❌ No configurada');
console.log('  KAPSO_BUSINESS_ACCOUNT_ID:', process.env.KAPSO_BUSINESS_ACCOUNT_ID || '❌ No configurada');
console.log('  WHATSAPP_NOTIFICATIONS_ENABLED:', process.env.WHATSAPP_NOTIFICATIONS_ENABLED || '❌ No configurada');

console.log('\n📱 Configuración del Servicio:');
console.log('  Servicio configurado:', WhatsAppService.isConfigured() ? '✅ Sí' : '❌ No');
console.log('  Phone Number ID:', WhatsAppService.phoneNumberId || '❌ No disponible');
console.log('  Business Account ID:', WhatsAppService.businessAccountId || '❌ No disponible');
console.log('  Notificaciones habilitadas:', WhatsAppService.enabled ? '✅ Sí' : '❌ No');

console.log('\n🧪 Prueba de Formateo de Números:');
const testNumbers = [
    '316 6651673',
    '57 316 6651673',
    '+57 316 6651673',
    '3166651673'
];

testNumbers.forEach(num => {
    const formatted = WhatsAppService.formatPhoneNumber(num);
    console.log(`  ${num.padEnd(20)} → ${formatted}`);
});

console.log('\n==========================================\n');

if (WhatsAppService.isConfigured()) {
    console.log('✅ Todo está configurado correctamente!');
    console.log('\n📝 Próximo paso: Ejecutar script de creación de templates');
    console.log('   node backend/scripts/createWhatsAppTemplates.js\n');
} else {
    console.log('❌ Hay problemas con la configuración');
    console.log('   Verifica las variables de entorno en .env\n');
    process.exit(1);
}
