import { useState, useEffect } from 'react';

const TERMS_ACCEPTANCE_KEY = 'ecucondor_terms_accepted';

export const useTermsAcceptance = () => {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(() => {
    const savedAcceptance = localStorage.getItem(TERMS_ACCEPTANCE_KEY);
    return savedAcceptance === 'true';
  });

  const [showTermsModal, setShowTermsModal] = useState(!hasAcceptedTerms);

  const acceptTerms = () => {
    localStorage.setItem(TERMS_ACCEPTANCE_KEY, 'true');
    setHasAcceptedTerms(true);
    setShowTermsModal(false);
  };

  useEffect(() => {
    if (!hasAcceptedTerms) {
      setShowTermsModal(true);
    }
  }, [hasAcceptedTerms]);

  return {
    hasAcceptedTerms,
    showTermsModal,
    setShowTermsModal,
    acceptTerms,
  };
};
