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

// Función para reemplazar console.* por Logger.* en un archivo
function replaceLogs(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Ignorar archivos específicos
    const fileName = path.basename(filePath);
    if (fileName.includes('logger.ts') || fileName.includes('replace-logs')) {
      return { processed: false, reason: 'archivo ignorado' };
    }

    // Verificar si hay console.* en el archivo
    if (!content.includes('console.')) {
      return { processed: false, reason: 'sin console.*' };
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
      return { 
        processed: true, 
        replacements: replacementCount,
        reason: `${replacementCount} logs reemplazados`
      };
    }

    return { processed: false, reason: 'sin cambios necesarios' };
  } catch (error) {
    return { 
      processed: false, 
      error: true,
      reason: error.message 
    };
  }
}

// Ejecutar el script
function main() {
  Logger.log('🔄 Buscando TODOS los archivos con logs...\n');

  const projectDir = __dirname;
  const allFiles = findFiles(projectDir);
  
  let processedCount = 0;
  let modifiedCount = 0;
  let totalReplacements = 0;
  
  Logger.log(`📁 Encontrados ${allFiles.length} archivos para revisar\n`);

  for (const file of allFiles) {
    const result = replaceLogs(file);
    const relativePath = path.relative(projectDir, file);
    
    if (result.processed) {
      processedCount++;
      modifiedCount++;
      totalReplacements += result.replacements || 0;
      Logger.log(`✅ ${relativePath} (${result.reason})`);
    } else if (result.error) {
      Logger.log(`❌ ${relativePath} - Error: ${result.reason}`);
    } else {
      // Solo mostrar algunos archivos sin cambios para no saturar
      if (processedCount < 10) {
        Logger.log(`⏭️  ${relativePath} - ${result.reason}`);
      }
    }
    
    processedCount++;
  }

  Logger.log(`\n📊 RESUMEN COMPLETO:`);
  Logger.log(`   📁 Archivos revisados: ${processedCount}`);
  Logger.log(`   ✅ Archivos modificados: ${modifiedCount}`);
  Logger.log(`   🔄 Total de logs reemplazados: ${totalReplacements}`);
  Logger.log(`\n✨ ¡PROCESO COMPLETADO!`);
  Logger.log(`\n📝 Ahora TODOS los logs se eliminarán automáticamente en producción`);
  Logger.log(`   pero seguirán funcionando en desarrollo.`);
}

main();
