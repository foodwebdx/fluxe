import WhatsAppService from '../infrastructure/services/WhatsAppService.js';

/**
 * Script para crear el template de cambio de fecha de entrega en KAPSO
 */
async function createDeliveryDateTemplate() {
    console.log('📱 Creando template de cambio de fecha de entrega...\n');

    const templateData = {
        name: 'cambio_fecha_entrega',
        category: 'UTILITY',
        language: 'es_MX',
        components: [
            {
                type: 'BODY',
                text: 'Hola {{1}},\n\n' +
                      'Te informamos que la fecha estimada de entrega de {{2}} ha sido actualizada.\n\n' +
                      '📅 Nueva fecha de entrega: {{3}}\n\n' +
                      'Gracias por tu confianza.'
            }
        ]
    };

    try {
        const result = await WhatsAppService.createTemplate(templateData);

        if (result.success) {
            console.log('✅ Template creado exitosamente');
            console.log('\nDetalles del template:');
            console.log('- Nombre:', templateData.name);
            console.log('- Categoría:', templateData.category);
            console.log('- Idioma:', templateData.language);
            console.log('\nParámetros:');
            console.log('{{1}} - Nombre del cliente');
            console.log('{{2}} - Nombre del producto');
            console.log('{{3}} - Nueva fecha de entrega');
            console.log('\nPrevisualización del mensaje:');
            console.log(templateData.components[0].text.replace('{{1}}', 'Juan Pérez').replace('{{2}}', 'Laptop Dell Inspiron').replace('{{3}}', '15 de enero de 2026'));
        } else {
            console.error('❌ Error al crear el template:', result.error);
            console.log('\nNota: Si el template ya existe, puedes usar el mensaje de texto simple que se envía automáticamente como fallback.');
        }
    } catch (error) {
        console.error('❌ Error inesperado:', error.message);
    }
}

// Ejecutar el script
createDeliveryDateTemplate()
    .then(() => {
        console.log('\n✅ Script completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error en el script:', error);
        process.exit(1);
    });
