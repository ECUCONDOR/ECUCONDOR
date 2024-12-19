import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/config/api';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        try {
          const response = await api.post('/auth/login', {
            email,
            password,
          });
          
          const token = response.data.token;
          set({ token, isAuthenticated: true });
          
          // Configurar el token en los headers de api
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error) {
          throw error;
        }
      },
      logout: () => {
        set({ token: null, isAuthenticated: false });
        delete api.defaults.headers.common['Authorization'];
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
