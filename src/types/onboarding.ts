export enum Steps {
  Welcome = 'welcome',
  ClientSelection = 'client-selection',
  Complete = 'complete'
}

export interface ClientFormData {
  first_name: string;
  last_name: string;
  name: string;
  type: 'personal' | 'business';
  address: string;
  identification: string;
  email: string;
  phone: string;
}

export interface ClientResponse {
  id: string
  name: string
  identification: string
  email: string
  phone: string
  type: 'personal' | 'business'
  address?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface OnboardingStep {
  id: string
  title: string
  description: string
  isComplete: boolean
}

export interface OnboardingProgress {
  currentStep: number
  steps: OnboardingStep[]
  selectedClient: ClientResponse | null
}

export interface VerificationDocument {
  id: string
  type: 'id' | 'address' | 'business' | 'other'
  path: string
  status: 'pending' | 'verified' | 'rejected'
  comments?: string
}

export interface VerificationStatus {
  id: string
  user_id: string
  client_id: string
  documents: VerificationDocument[]
  status: 'pending' | 'verified' | 'rejected'
  created_at: string
  updated_at: string
}
