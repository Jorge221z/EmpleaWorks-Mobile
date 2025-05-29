const fs = require('fs');
const path = require('path');

// Función para buscar archivos recursivamente
function findFiles(dir, extensions = ['.js', '.ts', '.tsx']) {
  let results = [];
  
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Ignorar directorios específicos
        if (!['node_modules', '.git', '.expo', 'android', 'ios', 'dist', 'build'].includes(file)) {
          results = results.concat(findFiles(filePath, extensions));
        }
      } else {
        const ext = path.extname(file);
        if (extensions.includes(ext)) {
          results.push(filePath);
        }
      }
    }
  } catch (error) {
    Logger.warn(`No se pudo leer directorio ${dir}:`, error.message);
  }
  
  return results;
}

// Función para reemplazar console.log por Logger en un archivo
function replaceLogs(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Ignorar el archivo logger.ts y este script
    if (filePath.includes('logger.ts') || filePath.includes('replace-logs.js')) {
      return false;
    }

    // Verificar si hay console.* en el archivo
    if (!content.includes('console.')) {
      return false;
    }

    // Verificar si ya tiene el import de Logger
    if (!content.includes("import Logger from")) {
      // Buscar donde insertar el import
      const lines = content.split('\n');
      let insertIndex = 0;
      
      // Buscar la línea después del último import
      for (let i = 0; i < Math.min(lines.length, 20); i++) {
        if (lines[i].trim().startsWith('import ') || lines[i].trim().includes(' from ')) {
          insertIndex = i + 1;
        }
      }

      // Determinar la ruta relativa al logger
      const relativePath = path.relative(path.dirname(filePath), path.join(__dirname, 'utils')).replace(/\\/g, '/');
      const finalPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
      const loggerImport = `import Logger from '${finalPath}/logger';`;
      
      lines.splice(insertIndex, 0, loggerImport);
      content = lines.join('\n');
      modified = true;
    }

    // Reemplazar todos los console.* con Logger.*
    const replacements = [
      { from: /console\.log\(/g, to: 'Logger.log(' },
      { from: /console\.error\(/g, to: 'Logger.error(' },
      { from: /console\.warn\(/g, to: 'Logger.warn(' },
      { from: /console\.info\(/g, to: 'Logger.info(' },
      { from: /console\.debug\(/g, to: 'Logger.debug(' }
    ];

    let replacementCount = 0;
    const originalContent = content;

    replacements.forEach(({ from, to }) => {
      const matches = content.match(from);
      if (matches) {
        replacementCount += matches.length;
        content = content.replace(from, to);
      }
    });

    if (content !== originalContent) {
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      Logger.log(`✅ Procesado: ${filePath} (${replacementCount} logs reemplazados)`);
      return true;
    }

    return false;
  } catch (error) {
    Logger.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

// Función principal
function main() {
  Logger.log('🚀 Iniciando reemplazo completo de logs...\n');

  const files = findFiles(__dirname);
  let processedCount = 0;
  let modifiedCount = 0;
  let totalReplacements = 0;

  for (const file of files) {
    processedCount++;
    if (replaceLogs(file)) {
      modifiedCount++;
    }
  }

  Logger.log(`\n📊 Resumen:`);
  Logger.log(`   Archivos encontrados: ${files.length}`);
  Logger.log(`   Archivos procesados: ${processedCount}`);
  Logger.log(`   Archivos modificados: ${modifiedCount}`);
  Logger.log('\n✨ ¡Proceso completado!');
  Logger.log('📝 Ahora todos los logs se eliminarán automáticamente en producción');
  Logger.log('   pero seguirán funcionando en desarrollo.');
}

// Ejecutar el script
main();
