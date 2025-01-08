import { createMachine } from 'xstate';
import { User } from '@supabase/supabase-js';

export interface RegistrationContext {
  user: Partial<User>;
  personalInfo: any;
  companyInfo?: any;
  verificationStatus: 'pending' | 'verified' | 'rejected' | null;
  error?: string;
}

export const registrationMachine = createMachine({
  id: 'registration',
  initial: 'initial',
  context: {
    user: {},
    personalInfo: null,
    companyInfo: null,
    verificationStatus: null,
    error: undefined,
  } as RegistrationContext,
  states: {
    initial: {
      on: {
        START: 'collectingPersonalInfo'
      }
    },
    collectingPersonalInfo: {
      on: {
        SUBMIT: [
          {
            target: 'collectingCompanyInfo',
            cond: (context, event) => event.data.userType === 'business',
            actions: ['savePersonalInfo']
          },
          {
            target: 'verifyingDocuments',
            actions: ['savePersonalInfo']
          }
        ],
        BACK: 'initial'
      }
    },
    collectingCompanyInfo: {
      on: {
        SUBMIT: {
          target: 'verifyingDocuments',
          actions: ['saveCompanyInfo']
        },
        BACK: 'collectingPersonalInfo'
      }
    },
    verifyingDocuments: {
      invoke: {
        src: 'verifyDocuments',
        onDone: {
          target: 'completed',
          actions: ['setVerificationStatus']
        },
        onError: {
          target: 'error',
          actions: ['setError']
        }
      },
      on: {
        BACK: 'collectingCompanyInfo'
      }
    },
    completed: {
      type: 'final'
    },
    error: {
      on: {
        RETRY: 'verifyingDocuments'
      }
    }
  }
});
