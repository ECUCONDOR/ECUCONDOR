import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ClientFormData, ClientResponse } from '@/types/onboarding';

export class ClientService {
  private supabase = createClientComponentClient();

  private validateClientData(data: ClientFormData) {
    console.log('Validando datos del cliente:', data);
    
    if (!data.name?.trim()) {
      throw new Error('El nombre es requerido');
    }
    if (!data.identification?.trim()) {
      throw new Error('La identificación es requerida');
    }
    if (!data.email?.trim()) {
      throw new Error('El email es requerido');
    }
    if (!data.phone?.trim()) {
      throw new Error('El teléfono es requerido');
    }
    if (!data.type) {
      throw new Error('El tipo de cliente es requerido');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new Error('El email no es válido');
    }
  }

  async createClient(data: ClientFormData): Promise<ClientResponse> {
    try {
      console.log('Datos recibidos en createClient:', data);
      
      this.validateClientData(data);

      // Obtener el token de la sesión actual
      const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('Error de sesión:', sessionError);
        throw new Error('No hay una sesión activa');
      }

      // Llamar a la Edge Function
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ...data,
          created_by: session.user.id
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Error en la respuesta del servidor:', error);
        throw new Error(error.message || 'Error al crear el cliente');
      }

      const { client: newClient } = await response.json();
      console.log('Cliente creado exitosamente:', newClient);
      return newClient;
    } catch (error) {
      console.error('Error en createClient:', error);
      throw error;
    }
  }

  async getUserClients(): Promise<ClientResponse[]> {
    try {
      // Obtener el token de la sesión actual
      const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('No hay una sesión activa');
      }

      // Llamar a la Edge Function
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/clients`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener los clientes');
      }

      const { clients } = await response.json();
      return clients;
    } catch (error) {
      console.error('Error en getUserClients:', error);
      throw error;
    }
  }

  async getClientById(id: string): Promise<ClientResponse | null> {
    try {
      const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('No hay una sesión activa');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/clients/${id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener el cliente');
      }

      const { client } = await response.json();
      return client;
    } catch (error) {
      console.error('Error en getClientById:', error);
      throw error;
    }
  }
}
