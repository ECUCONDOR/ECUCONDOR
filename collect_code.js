const fs = require('fs').promises;
const path = require('path');
const { exit } = require('process');

async function collectCode() {
  const filesToRead = [
    // Archivos de configuración principales
    '.env.example',
    '.env.local',
    '.env.production',
    '.gitignore',
    '.npmrc',
    '.nvmrc',
    '.vercelignore',
    'jsconfig.json',
    'next.config.js',
    'package.json',
    'postcss.config.js',
    'tailwind.config.js',
    'tailwind.config.ts',
    'tsconfig.json',
    'tsnode.config.json',
    'vercel.json',
    'middleware.ts',
    'next-env.d.ts',

    // Archivos principales de src
    'src/App.js',
    'src/main.js',
    'src/main.jsx',
    'src/main.tsx',
    'src/layout.tsx',
    'src/middleware.ts',
    'src/index.css',

    // Componentes
    'src/components/layout/Navbar.tsx',
    'src/components/layout/Footer.tsx',
    'src/components/layout/MainLayout.tsx',
    'src/components/registration/RegistrationFlow.tsx',
    'src/components/LoadingSpinner.js',
    'src/components/NotificationBell.js',
    'src/components/CurrencyConverter.js',
    'src/components/NegociacionForm.js',
    'src/components/NegociacionStatus.js',
    'src/components/UserList.js',

    // Páginas y rutas
    'src/app/dashboard/page.tsx',
    'src/registro-bancario/page.tsx',
    'src/app/layout.tsx',

    // Servicios y API
    'src/services/binanceService.ts',
    'src/services/userService.ts',
    'src/api/axios.js',

    // Contextos y Providers
    'src/providers/AuthProvider.tsx',
    'src/contexts/AuthContext.tsx',
    'src/contexts/NotificationContext.tsx',

    // Hooks y utilidades
    'src/hooks/useNegociacion.ts',
    'src/types/negociacion.ts',

    // Configuración de Supabase
    'supabase/config.toml',
    'supabase/seed.sql',
    'supabase/storage.sql',
    'supabase/functions.sql',
    'supabase/migrations/20250107_verification_tables.sql',

    // Archivos de configuración adicionales
    'prisma/schema.prisma',
    'src/config/constants.ts',
    'src/config/api.ts',
    
    // Utilidades y helpers
    'src/utils/auth.ts',
    'src/utils/format.ts',
    'src/utils/validation.ts',
    
    // Tipos y definiciones
    'src/types/user.ts',
    'src/types/auth.ts',
    'src/types/api.ts'
  ];

  let output = `\n--- START SCRIPT RUN ---\n`;
  output += `Script directory: ${__dirname}\n`;

  for (const filePath of filesToRead) {
    const fullPath = path.join(__dirname, filePath);
    try {
      await fs.access(fullPath, fs.constants.F_OK);
      output += `\n--- START OF FILE ${filePath} ---\n`;
      const content = await fs.readFile(fullPath, 'utf-8');
      output += content;
    } catch (error) {
      console.error(`Error reading file: ${fullPath}`, error);
      output += `\n--- START OF FILE ${filePath} ---\n`;
      output += `Error reading file: ${filePath} ${error}\n`;
    }
  }

  output += `\n--- END OF FILES ---\n`;

  try {
    await fs.writeFile('output_code.txt', output);
    console.log('Successfully generated output_code.txt');
  } catch (error) {
    console.error(`Error writing output_code.txt`, error);
  }
}

collectCode().catch(error => {
  console.error('Fatal error:', error);
  exit(1);
});