import { createClient } from '@/lib/supabase/config';

interface ClientData {
  id?: string;
  name: string;
  identification: string;
  email: string;
  phone: string;
  type: 'personal' | 'business';
  address?: string;
}

export const clientService = {
  async createClient(clientData: ClientData) {
    const supabase = createClient();
    
    try {
      // Call the Edge Function
      const response = await fetch(
        process.env.NEXT_PUBLIC_SUPABASE_EDGE_FUNCTION_URL!, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify(clientData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create client');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },

  async getClientByUserId() {
    const supabase = createClient();
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_EDGE_FUNCTION_URL}/user`, 
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch client');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
  }
};
