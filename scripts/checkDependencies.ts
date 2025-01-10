import * as fs from 'fs';

interface PackageJson {
  dependencies: {
    [key: string]: string;
  };
  engines?: {
    node?: string;
  };
}

function checkDependencies(): void {
  const packageJson: PackageJson = JSON.parse(
    fs.readFileSync('./package.json', 'utf8')
  );

  const requiredDeps: string[] = [
    '@supabase/auth-helpers-react',
    'next',
    'react',
    'react-dom'
  ];

  const missing = requiredDeps.filter(
    (dep: string) => !packageJson.dependencies[dep]
  );

  if (missing.length > 0) {
    console.error('Dependencias faltantes:', missing);
    process.exit(1);
  }

  // Verificar versiones de Node y pnpm
  const nodeVersion: string = process.version;
  const versionParts = nodeVersion.slice(1).split('.');
  const majorVersion: number = versionParts[0] ? parseInt(versionParts[0], 10) : 0;
  
  if (majorVersion < 20) {
    console.error('Se requiere Node.js versión 20+');
    process.exit(1);
  }
}

checkDependencies();
