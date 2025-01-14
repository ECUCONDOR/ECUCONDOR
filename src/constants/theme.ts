export const COLORS = {
  // Colores principales
  primary: {
    DEFAULT: '#1E40AF', // Azul principal
    hover: '#1E3A8A',
    light: '#3B82F6',
    dark: '#1E3A8A',
  },
  
  // Fondo
  background: {
    DEFAULT: '#0B1120', // Fondo principal oscuro
    card: '#111827',    // Fondo de tarjetas
    input: '#1F2937',   // Fondo de inputs
  },
  
  // Bordes
  border: {
    DEFAULT: '#374151',
    hover: '#4B5563',
    focus: '#3B82F6',
  },
  
  // Texto
  text: {
    primary: '#F3F4F6',   // Texto principal
    secondary: '#9CA3AF', // Texto secundario
    muted: '#6B7280',     // Texto deshabilitado
  },
  
  // Estados
  status: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  }
} as const;
