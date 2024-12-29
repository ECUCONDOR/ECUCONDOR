'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Session, User } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import { logger } from '@/lib/logger';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        logger.info('Initializing authentication');
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession) {
          logger.info('Session found during initialization', {
            userId: currentSession.user.id,
            email: currentSession.user.email
          });
          setSession(currentSession);
          setUser(currentSession.user);
          // Si hay una sesión activa, redirigir al dashboard
          router.replace('/dashboard');
        } else {
          logger.info('No active session found during initialization');
          // Si no hay sesión, asegurarse de que el usuario esté en la página pública
          if (!window.location.pathname.startsWith('/auth')) {
            router.replace('/');
          }
        }
      } catch (error) {
        logger.error('Error initializing auth:', error);
        router.replace('/');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      logger.info('Auth state changed', { event, userId: currentSession?.user?.id });
      
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
      } else {
        setSession(null);
        setUser(null);
      }
      setIsLoading(false);

      switch (event) {
        case 'SIGNED_IN':
          logger.info('User signed in successfully', {
            userId: currentSession?.user?.id,
            email: currentSession?.user?.email
          });
          router.refresh();
          router.replace('/dashboard');
          break;
        case 'SIGNED_OUT':
          logger.info('User signed out');
          setSession(null);
          setUser(null);
          router.refresh();
          router.replace('/');
          break;
        case 'TOKEN_REFRESHED':
          logger.info('Token refreshed successfully', {
            userId: currentSession?.user?.id
          });
          break;
        case 'USER_UPDATED':
          logger.info('User profile updated', {
            userId: currentSession?.user?.id
          });
          break;
        case 'USER_DELETED':
          logger.warn('User account deleted', {
            userId: currentSession?.user?.id
          });
          router.replace('/');
          break;
      }
    });

    return () => {
      logger.debug('Cleaning up auth subscriptions');
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const signOut = async () => {
    try {
      logger.info('Iniciando proceso de cierre de sesión');
      setIsLoading(true);

      // Primero, invalidar la sesión en Supabase
      const { error } = await supabase.auth.signOut({
        scope: 'global' // Cierra sesión en todos los dispositivos
      });

      if (error) {
        logger.error('Error durante el cierre de sesión:', error);
        throw error;
      }

      logger.info('Cierre de sesión exitoso en Supabase');

      // Limpiar el estado local inmediatamente
      setSession(null);
      setUser(null);

      // Limpiar cualquier dato local almacenado
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();

      // Forzar la actualización del router y la navegación
      logger.info('Redirigiendo a la página principal');
      router.refresh();
      
      // Esperar a que la redirección se complete
      try {
        await router.replace('/');
        logger.info('Redirección completada exitosamente');
      } catch (redirectError) {
        logger.error('Error durante la redirección:', redirectError);
        // Intentar redirección alternativa si falla
        window.location.href = '/';
      }
    } catch (error) {
      logger.error('Error en el proceso de cierre de sesión:', error);
      // Mostrar notificación de error si está disponible
      if (window.Notification && Notification.permission === 'granted') {
        new Notification('Error al cerrar sesión', {
          body: 'Por favor, intenta nuevamente o recarga la página.'
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
      logger.info('Proceso de cierre de sesión finalizado');
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
