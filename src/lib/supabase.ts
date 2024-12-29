import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export function handleSupabaseError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = String(error.message);
    
    // Errores comunes de autenticación
    if (message.includes('Email not confirmed')) {
      return 'Por favor, confirma tu correo electrónico';
    }
    if (message.includes('Invalid login credentials')) {
      return 'Credenciales inválidas';
    }
    if (message.includes('User not found')) {
      return 'Usuario no encontrado';
    }
    if (message.includes('Password is too short')) {
      return 'La contraseña es demasiado corta';
    }
    if (message.includes('Email already taken')) {
      return 'El correo electrónico ya está registrado';
    }
    
    return message;
  }
  
  return 'Ha ocurrido un error inesperado';
}
