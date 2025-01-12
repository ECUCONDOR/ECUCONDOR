'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { logError } from '@/lib/utils/error-handler';
import { Dialog } from '@/components/ui/dialog';

interface TermsWrapperProps {
  children: React.ReactNode;
}

export default function TermsWrapper({ children }: TermsWrapperProps) {
  const { user, loading } = useAuth();
  const [showTerms, setShowTerms] = useState(false);
  const [checkingTerms, setCheckingTerms] = useState(true);

  useEffect(() => {
    const checkTerms = async () => {
      if (!user) {
        setCheckingTerms(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('user_terms')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          throw error;
        }

        setShowTerms(!data);
        setCheckingTerms(false);
      } catch (error) {
        logError('terms-check', error);
        setCheckingTerms(false);
      }
    };

    if (user && !loading) {
      checkTerms();
    }
  }, [user, loading]);

  const acceptTerms = async () => {
    if (!user) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('user_terms')
        .insert([{ user_id: user.id }]);

      if (error) throw error;

      setShowTerms(false);
    } catch (error) {
      logError('terms-accept', error);
    }
  };

  if (loading || checkingTerms) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {children}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Términos y Condiciones</h2>
          <div className="prose max-w-none mb-4">
            <p>Por favor, lea y acepte nuestros términos y condiciones para continuar.</p>
            {/* Aquí va el contenido de los términos */}
          </div>
          <div className="flex justify-end gap-4">
            <button
              onClick={acceptTerms}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Aceptar
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
