'use client';

import { useAuth } from '@/contexts/auth-context';
import TermsAndConditions from '@/components/TermsAndConditions';

interface TermsWrapperProps {
  children: React.ReactNode;
}

export function TermsWrapper({ children }: TermsWrapperProps) {
  const { showTermsModal, setShowTermsModal, acceptTerms } = useAuth();

  return (
    <>
      {children}
      <TermsAndConditions
        open={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={acceptTerms}
      />
    </>
  );
}
