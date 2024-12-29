'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BankTransferForm } from "@/components/payments/BankTransferForm";
import { PageHeader } from "@/components/ui/page-header";
import { Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BankTransferPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [session, setSession] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      if (!currentSession) {
        router.push('/auth/login');
      }
    };

    checkSession();
  }, [supabase, router]);

  if (!session) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>
            Por favor inicia sesión para acceder a las transferencias bancarias.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Transferencia Bancaria"
        description="Registre su cuenta bancaria para recibir pagos"
        icon={<Building2 className="w-6 h-6" />}
      />
      <div className="mt-8 max-w-2xl mx-auto">
        <BankTransferForm />
      </div>
    </div>
  );
}
