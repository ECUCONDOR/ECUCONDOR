import { createClient } from '@/lib/supabase/config';
import type { Database } from '@/types/supabase';

interface ClientData {
  first_name: string;
  last_name: string;
  identification: string;
  email: string;
  phone?: string;
  type?: 'personal' | 'business';
}

interface Client extends ClientData {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

class ClientService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/clients`;
  }

  private async getAuthToken(): Promise<string> {
    const { createClient } = await import('@/lib/supabase/config');
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      throw new Error('No hay una sesión activa');
    }
    
    return session.access_token;
  }

  async createClient(data: ClientData): Promise<Client> {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          type: data.type || 'personal'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          throw new Error('Ya existe un cliente con esta identificación');
        }
        throw new Error(errorData.error || 'Error al crear el cliente');
      }

      const { client } = await response.json();
      return client;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  async getClientByIdentification(identification: string): Promise<Client | null> {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(
        `${this.baseUrl}?identification=${encodeURIComponent(identification)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          return null;
        }
        throw new Error(errorData.error || 'Error al obtener el cliente');
      }

      const { client } = await response.json();
      return client;
    } catch (error) {
      console.error('Error getting client:', error);
      throw error;
    }
  }

  async getClientByUserId(): Promise<Client | null> {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(this.baseUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          return null;
        }
        throw new Error(errorData.error || 'Error al obtener el cliente');
      }

      const { clients } = await response.json();
      return clients?.[0] || null;
    } catch (error) {
      console.error('Error getting user client:', error);
      throw error;
    }
  }
}

export const clientService = new ClientService();
