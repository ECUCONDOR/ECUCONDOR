'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';

const QRCode = dynamic(() => import('react-qr-code'), { ssr: false });

export default function QRCodePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [qrData, setQrData] = useState<string | null>(null);

  useEffect(() => {
    const loadQRData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setQrData(session.user.id);
      }
    };

    loadQRData();
  }, [supabase]);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Tu Código QR</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            {qrData && (
              <div style={{ height: "auto", maxWidth: "100%", width: "100%" }}>
                <QRCode
                  value={qrData}
                  size={256}
                  level="H"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
