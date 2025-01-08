import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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

interface ValidationError {
  field: string;
  message: string;
}

interface ApiResponse {
  message?: string;
  code?: string;
  error?: string;
  client?: Client;
  clients?: Client[];
  clientId?: string;
  validationErrors?: ValidationError[];
}

export class ClientError extends Error {
  code: string;
  validationErrors?: ValidationError[];
  clientId?: string;

  constructor(message: string, code: string, validationErrors?: ValidationError[], clientId?: string) {
    super(message);
    this.name = 'ClientError';
    this.code = code;
    this.validationErrors = validationErrors;
    this.clientId = clientId;
  }
}

class ClientService {
  private baseUrl: string;
  private supabase;

  constructor() {
    this.baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/clients`;
    this.supabase = createClientComponentClient();
  }

  private async getAuthToken(): Promise<string> {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    if (error || !session) {
      throw new ClientError(
        'No se pudo obtener el token de autenticación',
        'AUTH_ERROR'
      );
    }
    return session.access_token;
  }

  private handleApiError(response: Response, data: ApiResponse): never {
    switch (data.code) {
      case 'VALIDATION_ERROR':
        throw new ClientError(
          'Error de validación',
          'VALIDATION_ERROR',
          data.validationErrors
        );
      case 'DUPLICATE_CLIENT':
        throw new ClientError(
          'Ya existe un cliente con esta identificación',
          'DUPLICATE_CLIENT',
          undefined,
          data.clientId
        );
      case 'CLIENT_NOT_FOUND':
        throw new ClientError(
          'Cliente no encontrado',
          'CLIENT_NOT_FOUND'
        );
      case 'UNAUTHORIZED':
      case 'INVALID_TOKEN':
        throw new ClientError(
          'Error de autenticación',
          'AUTH_ERROR'
        );
      default:
        throw new ClientError(
          data.message || data.error || 'Error desconocido',
          data.code || 'UNKNOWN_ERROR'
        );
    }
  }

  async createClient(data: ClientData): Promise<Client> {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        this.handleApiError(response, result);
      }

      if (!result.client) {
        throw new ClientError(
          'No se recibieron los datos del cliente',
          'INVALID_RESPONSE'
        );
      }

      return result.client;
    } catch (err) {
      if (err instanceof ClientError) {
        throw err;
      }
      throw new ClientError(
        'Error al crear el cliente',
        'UNKNOWN_ERROR'
      );
    }
  }

  async getClientByIdentification(identification: string): Promise<Client | null> {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.baseUrl}?identification=${identification}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        this.handleApiError(response, result);
      }

      return result.client || null;
    } catch (err) {
      if (err instanceof ClientError) {
        throw err;
      }
      throw new ClientError(
        'Error al obtener el cliente',
        'UNKNOWN_ERROR'
      );
    }
  }

  async getAllClients(): Promise<Client[]> {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        this.handleApiError(response, result);
      }

      return result.clients || [];
    } catch (err) {
      if (err instanceof ClientError) {
        throw err;
      }
      throw new ClientError(
        'Error al obtener los clientes',
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Format validation errors into a user-friendly message
   */
  formatValidationErrors(errors: ValidationError[]): string {
    return errors
      .map(error => `${error.field}: ${error.message}`)
      .join('\n');
  }
}

export const clientService = new ClientService();
