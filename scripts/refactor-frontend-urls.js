#!/usr/bin/env node

/**
 * Script para refactorizar URLs del frontend
 * Reemplaza http://localhost:3000 por apiUrl()
 */

const fs = require('fs');
const path = require('path');

// Archivos a modificar
const filesToModify = [
    'Frontend/src/pages/Login.jsx',
    'Frontend/src/pages/Ordenes.jsx',
    'Frontend/src/pages/OrdenDetail.jsx',
    'Frontend/src/pages/Clientes.jsx',
    'Frontend/src/pages/Productos.jsx',
    'Frontend/src/pages/Flujos.jsx',
    'Frontend/src/pages/Estados.jsx',
    'Frontend/src/pages/Usuarios.jsx',
    'Frontend/src/components/orden/EvidenciasSection.jsx',
    'Frontend/src/components/orden/EstadosTimeline.jsx',
    'Frontend/src/components/orden/ComentariosSection.jsx',
    'Frontend/src/components/orden/OrdenInfoCard.jsx',
];

// Función para determinar el path relativo correcto
function getRelativePath(filePath) {
    if (filePath.includes('/pages/')) {
        return '../config/api';
    } else if (filePath.includes('/components/orden/')) {
        return '../../config/api';
    }
    return '../config/api';
}

// Función para procesar un archivo
function processFile(filePath) {
    const fullPath = path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  Archivo no encontrado: ${filePath}`);
        return { modified: false, count: 0 };
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    // Contar ocurrencias
    const matches = content.match(/http:\/\/localhost:3000/g);
    const count = matches ? matches.length : 0;

    if (count === 0) {
        console.log(`✅ ${filePath} - Ya está actualizado`);
        return { modified: false, count: 0 };
    }

    // Verificar si ya tiene el import
    const hasImport = content.includes("import { apiUrl } from");

    // Agregar import si no existe
    if (!hasImport) {
        const relativePath = getRelativePath(filePath);
        const importStatement = `import { apiUrl } from '${relativePath}';\n`;

        // Buscar la última línea de import
        const lines = content.split('\n');
        let lastImportIndex = -1;

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().startsWith('import ')) {
                lastImportIndex = i;
            }
        }

        if (lastImportIndex >= 0) {
            lines.splice(lastImportIndex + 1, 0, importStatement);
            content = lines.join('\n');
        } else {
            // Si no hay imports, agregar al inicio
            content = importStatement + content;
        }
    }

    // Reemplazar todas las ocurrencias de http://localhost:3000
    content = content.replace(
        /fetch\('http:\/\/localhost:3000(\/[^']+)'\)/g,
        "fetch(apiUrl('$1'))"
    );

    content = content.replace(
        /fetch\(`http:\/\/localhost:3000(\/[^`]+)`\)/g,
        "fetch(apiUrl(`$1`))"
    );

    // Guardar el archivo
    fs.writeFileSync(fullPath, content, 'utf8');

    console.log(`✅ ${filePath} - ${count} ocurrencias reemplazadas`);
    return { modified: true, count };
}

// Procesar todos los archivos
console.log('🚀 Iniciando refactorización de URLs del frontend...\n');

let totalModified = 0;
let totalOccurrences = 0;

filesToModify.forEach(filePath => {
    const result = processFile(filePath);
    if (result.modified) {
        totalModified++;
    }
    totalOccurrences += result.count;
});

console.log('\n📊 Resumen:');
console.log(`   Archivos modificados: ${totalModified}/${filesToModify.length}`);
console.log(`   Total de ocurrencias reemplazadas: ${totalOccurrences}`);
console.log('\n✅ Refactorización completada!');
console.log('\n💡 Próximos pasos:');
console.log('   1. Verificar que no haya errores: npm run lint (en Frontend)');
console.log('   2. Probar localmente: npm run dev');
console.log('   3. Commit: git add . && git commit -m "feat: Refactorizar URLs para producción"');
