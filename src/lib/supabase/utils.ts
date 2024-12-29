import { supabase } from './client'

export async function checkSupabaseConnection() {
  try {
    const { error } = await supabase.from('health_check').select('count')
    return !error
  } catch (error) {
    console.error('Error al verificar conexión con Supabase:', error)
    return false
  }
}

export async function handleSupabaseError(error: unknown): Promise<string> {
  if (typeof error === 'object' && error !== null) {
    // Errores de Supabase
    if ('code' in error && 'message' in error) {
      const supabaseError = error as { code: string; message: string }
      
      switch (supabaseError.code) {
        case 'auth/invalid-email':
          return 'El correo electrónico no es válido'
        case 'auth/user-not-found':
          return 'Usuario no encontrado'
        case 'auth/wrong-password':
          return 'Contraseña incorrecta'
        case '23505': // Unique violation
          return 'Ya existe un registro con estos datos'
        case '23503': // Foreign key violation
          return 'Operación no permitida: registro relacionado no existe'
        default:
          return supabaseError.message
      }
    }
    
    // Error general con mensaje
    if ('message' in error) {
      return String(error.message)
    }
  }
  
  return 'Error inesperado'
}
