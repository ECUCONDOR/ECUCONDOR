import type { Database } from './database.types';

export enum Steps {
  Welcome = 'welcome',
  ClientSelection = 'client-selection',
  Complete = 'complete'
}

export type ClientFormData = Omit<Database['public']['Tables']['clients']['Insert'], 'id' | 'created_at' | 'updated_at'> & { 
  created_by?: string 
};

export type ClientResponse = Database['public']['Tables']['clients']['Row'];

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isComplete: boolean;
}

export interface OnboardingProgress {
  currentStep: number;
  steps: OnboardingStep[];
  selectedClient: ClientResponse | null;
}

export interface VerificationDocument {
  id: string;
  type: 'id' | 'address' | 'business' | 'other';
  path: string;
  status: 'pending' | 'verified' | 'rejected';
  comments?: string;
}

export interface VerificationStatus {
  id: string;
  user_id: string;
  client_id: string;
  documents: VerificationDocument[];
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
}
