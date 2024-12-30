'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QRCode from 'react-qr-code';

export default function QRCodePage() {
  const supabase = createClientComponentClient();
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
              <QRCode
                value={qrData}
                size={256}
                level="H"
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
