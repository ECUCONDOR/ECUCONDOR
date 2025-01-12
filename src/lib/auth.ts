import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export interface AuthResponse {
  error: any | null
  success: boolean
  message?: string
  code?: string
}

export const auth = {
  async signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      if (!email || !password) {
        return {
          error: new Error('Credenciales incompletas'),
          success: false,
          message: 'Por favor ingrese email y contraseña',
          code: 'AUTH_INCOMPLETE_CREDENTIALS'
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let message = 'Error al iniciar sesión';
        let code = 'AUTH_UNKNOWN_ERROR';
        
        if (error.message.includes('Invalid login credentials')) {
          message = 'Credenciales inválidas';
          code = 'AUTH_INVALID_CREDENTIALS';
        } else if (error.message.includes('Email not confirmed')) {
          message = 'Email no confirmado';
          code = 'AUTH_EMAIL_NOT_CONFIRMED';
        }
        
        throw { ...error, code, message };
      }

      return {
        error: null,
        success: true,
        message: 'Inicio de sesión exitoso',
        code: 'AUTH_SUCCESS'
      };
    } catch (error: any) {
      console.error('Error en signInWithEmail:', error);
      return {
        error,
        success: false,
        message: error.message || 'Error al iniciar sesión',
        code: error.code || 'AUTH_UNKNOWN_ERROR'
      };
    }
  },

  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        throw {
          ...error,
          code: 'AUTH_GOOGLE_ERROR',
          message: 'Error al iniciar sesión con Google'
        };
      }

      return {
        error: null,
        success: true,
        code: 'AUTH_GOOGLE_SUCCESS'
      };
    } catch (error: any) {
      console.error('Error en signInWithGoogle:', error);
      return {
        error,
        success: false,
        message: error.message || 'Error al iniciar sesión con Google',
        code: error.code || 'AUTH_GOOGLE_ERROR'
      };
    }
  },

  async signOut(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw {
          ...error,
          code: 'AUTH_SIGNOUT_ERROR',
          message: 'Error al cerrar sesión'
        };
      }

      return {
        error: null,
        success: true,
        message: 'Sesión cerrada correctamente',
        code: 'AUTH_SIGNOUT_SUCCESS'
      };
    } catch (error: any) {
      console.error('Error en signOut:', error);
      return {
        error,
        success: false,
        message: error.message || 'Error al cerrar sesión',
        code: error.code || 'AUTH_SIGNOUT_ERROR'
      };
    }
  },

  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error al obtener sesión:', error);
        throw error;
      }
      return session;
    } catch (error) {
      console.error('Error al obtener sesión:', error);
      return null;
    }
  },

  async getUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error al obtener usuario:', error);
        throw error;
      }
      return user;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await this.getSession();
      return !!session;
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      return false;
    }
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      callback(event, session);
    });
  }
}
