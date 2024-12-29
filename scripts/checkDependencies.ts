import { execSync } from 'child_process';
import * as fs from 'fs';

function checkDependencies() {
  const packageJson = JSON.parse(
    fs.readFileSync('./package.json', 'utf8')
  );

  const requiredDeps = [
    '@supabase/auth-helpers-react',
    'next',
    'react',
    'react-dom'
  ];

  const missing = requiredDeps.filter(
    dep => !packageJson.dependencies[dep]
  );

  if (missing.length > 0) {
    console.error('Dependencias faltantes:', missing);
    process.exit(1);
  }

  // Verificar versiones de Node y pnpm
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 20) {
    console.error('Se requiere Node.js versión 20+');
    process.exit(1);
  }
}

checkDependencies();
