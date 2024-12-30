import { supabase } from '@/lib/supabase';

export const authService = {
  isAuthenticated: () => {
    const session = supabase.auth.getSession();
    return session !== null;
  },

  signIn: async (email: string, password: string) => {
    const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return user;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};
