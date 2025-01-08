export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  identification: string;
  email: string;
  phone?: string;
  address?: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
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
