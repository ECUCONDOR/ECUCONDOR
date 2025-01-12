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

export interface Database {
  public: {
    Tables: {
      user_terms: {
        Row: {
          id: string;
          user_id: string;
          accepted_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          accepted_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          accepted_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      get_dashboard_data: {
        Args: {
          p_client_id: string;
        };
        Returns: {
          user_info: {
            id: string;
            email: string;
            created_at: string;
          };
          terms_accepted: boolean;
        };
      };
    };
  };
}
