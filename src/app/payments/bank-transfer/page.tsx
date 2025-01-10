'use client';

import { createClientComponentClient } from '@supabase/ssr';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BankTransferForm } from "@/components/payments/BankTransferForm";
import { PageHeader } from "@/components/ui/page-header";
import { Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from '@supabase/supabase-js';

export default function BankTransferPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

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
            Checking authentication status...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title="Bank Transfer"
        description="Transfer funds using bank transfer"
        icon={<Building2 className="w-6 h-6" />}
      />
      <div className="mt-8">
        <BankTransferForm session={session} />
      </div>
    </div>
  );
}
