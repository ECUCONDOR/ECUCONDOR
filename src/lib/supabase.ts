import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

const supabaseUrl = 'https://adhivizuhfdxthpgqlxw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkaGl2aXp1aGZkeHRocGdxbHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA3MzQ0NjIsImV4cCI6MjA0NjMxMDQ2Mn0.kUsTt-JMqWsLiLzzx1ET-Js_r_x5qLnppSeSiKP9Q7E';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing environment variables for Supabase. Please check your .env file.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const createBrowserSupabaseClient = () => {
  return createBrowserClient<Database>({
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  });
};

// Manejador de errores de Supabase
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
    if (message.includes('PGRST116')) {
      return 'No se encontró el recurso solicitado';
    }
    
    return message;
  }
  
  return 'Ha ocurrido un error inesperado';
}

// Tipos de respuesta comunes
export interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
}
