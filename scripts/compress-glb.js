import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelDir = path.resolve(__dirname, '../public/3D Model');
const backupDir = path.join(modelDir, 'backups');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Filtra só .glb e que não estejam nos backups
const files = fs.readdirSync(modelDir).filter(f => f.endsWith('.glb') && !f.includes('_draco.glb') && f !== 'saturn.glb');

console.log(`🚀 Iniciando compressão Draco para ${files.length} arquivos...`);

files.forEach(file => {
  const input = path.join(modelDir, file);
  const output = path.join(modelDir, file.replace('.glb', '_draco.glb'));
  const backup = path.join(backupDir, file);

  console.log(`\n📦 Processando: ${file}...`);
  try {
    // Executa gltf-pipeline com draco compression (-d)
    const cmd = `npx -y gltf-pipeline -i "${input}" -o "${output}" -d`;
    console.log(`Executando: ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });
    
    if (fs.existsSync(output)) {
      const statsOrig = fs.statSync(input);
      const statsNew = fs.statSync(output);
      const reduction = ((1 - statsNew.size / statsOrig.size) * 100).toFixed(1);
      
      console.log(`✅ Sucesso! Redução de ${reduction}% (${(statsOrig.size / 1024 / 1024).toFixed(2)}MB -> ${(statsNew.size / 1024 / 1024).toFixed(2)}MB)`);
      
      // Move original para backup
      fs.renameSync(input, backup);
      // Move novo para nome original
      fs.renameSync(output, input);
    }
  } catch (err) {
    console.error(`❌ Erro em ${file}: ${err.message}`);
  }
});

console.log(`\n✨ Compressão finalizada! Originais salvos em ${backupDir}`);
