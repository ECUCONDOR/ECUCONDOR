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
      payments: {
        Row: {
          id: string;
          type: 'PIX' | 'QR' | 'CARD';
          amount: number;
          description: string;
          userId: string;
          status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'DISPUTED';
          cardDetails?: {
            number: string;
            expiry: string;
            cvc: string;
          };
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          type: 'PIX' | 'QR' | 'CARD';
          amount: number;
          description: string;
          userId: string;
          status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'DISPUTED';
          cardDetails?: {
            number: string;
            expiry: string;
            cvc: string;
          };
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          type?: 'PIX' | 'QR' | 'CARD';
          amount?: number;
          description?: string;
          userId?: string;
          status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'DISPUTED';
          cardDetails?: {
            number: string;
            expiry: string;
            cvc: string;
          };
          updatedAt?: string;
        };
      };
      disputes: {
        Row: {
          id: string;
          paymentId: string;
          reason: string;
          userId: string;
          status: 'OPEN' | 'RESOLVED' | 'REJECTED';
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          paymentId: string;
          reason: string;
          userId: string;
          status?: 'OPEN' | 'RESOLVED' | 'REJECTED';
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          paymentId?: string;
          reason?: string;
          userId?: string;
          status?: 'OPEN' | 'RESOLVED' | 'REJECTED';
          updatedAt?: string;
        };
      };
      custody_accounts: {
        Row: {
          id: string;
          userId: string;
          type: string;
          balance: number;
          currency: string;
          status: string;
          dailyLimit: number;
          monthlyLimit: number;
          recentOperations: Json[];
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          userId: string;
          type: string;
          balance?: number;
          currency: string;
          status?: string;
          dailyLimit?: number;
          monthlyLimit?: number;
          recentOperations?: Json[];
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          userId?: string;
          type?: string;
          balance?: number;
          currency?: string;
          status?: string;
          dailyLimit?: number;
          monthlyLimit?: number;
          recentOperations?: Json[];
          updatedAt?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      payment_type: 'PIX' | 'QR' | 'CARD';
      payment_status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'DISPUTED';
      dispute_status: 'OPEN' | 'RESOLVED' | 'REJECTED';
    };
  };
}
