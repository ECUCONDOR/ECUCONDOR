export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          email: string;
          nombre: string;
          apellido: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      pagos: {
        Row: {
          id: string;
          usuario_id: string;
          monto: number;
          estado: string;
          metodo_pago: string;
          orden_id: string;
          created_at: string;
          updated_at: string;
          detalles?: Record<string, unknown>;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      ordenes: {
        Row: {
          id: string;
          usuario_id: string;
          estado: string;
          monto: number;
          created_at: string;
          updated_at: string;
          detalles?: Record<string, unknown>;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      registro_bancario: {
        Row: {
          id: string;
          usuario_id: string;
          tipo: string;
          monto: number;
          created_at: string;
          updated_at: string;
          detalles?: Record<string, unknown>;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      documentos: {
        Row: {
          id: string;
          usuario_id: string;
          tipo: string;
          estado: string;
          created_at: string;
          updated_at: string;
          detalles?: Record<string, unknown>;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
}
