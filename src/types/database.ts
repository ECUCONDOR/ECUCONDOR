export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  type: 'personal' | 'business';
  identification: string;
  email: string;
  phone: string;
  address?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ClientInput {
  first_name: string;
  last_name: string;
  identification: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface ApiError {
  message: string;
  details?: string;
}
