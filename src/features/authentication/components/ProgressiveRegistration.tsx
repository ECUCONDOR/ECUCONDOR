import React from 'react';
import { useMachine } from '@xstate/react';
import { registrationMachine } from '../machines/registrationMachine';
import { supabase } from '@/lib/supabase';

// Components
import BasicInformationStep from './steps/BasicInformationStep';
import CompanyVerificationStep from './steps/CompanyVerificationStep';
import DocumentVerificationStep from './steps/DocumentVerificationStep';
import RegistrationComplete from './steps/RegistrationComplete';
import ErrorStep from './steps/ErrorStep';

export default function ProgressiveRegistration() {
  const [state, send] = useMachine(registrationMachine, {
    services: {
      verifyDocuments: async (context) => {
        try {
          const { data: documents } = await supabase.storage
            .from('verification-documents')
            .list(`${context.user.id}`);

          const response = await fetch(
            'https://adhivizuhfdxthpgqlxw.functions.supabase.co/verify-documents',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
              },
              body: JSON.stringify({
                documents,
                userId: context.user.id,
                clientId: context.companyInfo?.id,
              }),
            }
          );

          if (!response.ok) {
            throw new Error('Failed to verify documents');
          }

          return await response.json();
        } catch (error) {
          console.error('Error verifying documents:', error);
          throw error;
        }
      },
    },
    actions: {
      savePersonalInfo: (context, event) => {
        context.personalInfo = event.data;
      },
      saveCompanyInfo: (context, event) => {
        context.companyInfo = event.data;
      },
      setVerificationStatus: (context, event) => {
        context.verificationStatus = event.data.status;
      },
      setError: (context, event) => {
        context.error = event.data.message;
      },
    },
  });

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white shadow-xl rounded-lg p-6">
        {state.matches('collectingPersonalInfo') && (
          <BasicInformationStep
            onSubmit={(data) => send('SUBMIT', { data })}
            onBack={() => send('BACK')}
          />
        )}

        {state.matches('collectingCompanyInfo') && (
          <CompanyVerificationStep
            personalInfo={state.context.personalInfo}
            onSubmit={(data) => send('SUBMIT', { data })}
            onBack={() => send('BACK')}
          />
        )}

        {state.matches('verifyingDocuments') && (
          <DocumentVerificationStep
            userId={state.context.user.id}
            clientId={state.context.companyInfo?.id}
            onBack={() => send('BACK')}
          />
        )}

        {state.matches('completed') && (
          <RegistrationComplete
            verificationStatus={state.context.verificationStatus}
          />
        )}

        {state.matches('error') && (
          <ErrorStep
            error={state.context.error}
            onRetry={() => send('RETRY')}
          />
        )}
      </div>
    </div>
  );
}
