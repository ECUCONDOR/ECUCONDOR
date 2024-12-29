import { createClient } from '@supabase/supabase-js';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

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
}

export const auth = {
  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      return {
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error en signInWithGoogle:', error)
      return {
        error: error,
        success: false,
        message: 'Error al iniciar sesión con Google'
      }
    }
  },

  async signOut(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      return {
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error en signOut:', error)
      return {
        error: error,
        success: false,
        message: 'Error al cerrar sesión'
      }
    }
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Error al obtener sesión:', error)
    }
    return session
  },

  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Error al obtener usuario:', error)
    }
    return user
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/login',
    error: '/auth/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Por favor ingrese email y contraseña');
          }

          const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (signInError) {
            console.error('Login error:', signInError);
            throw new Error('Credenciales inválidas');
          }

          if (!user) {
            throw new Error('Usuario no encontrado');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email,
          };
        } catch (error: any) {
          console.error('Auth error:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.email = token.email;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};
