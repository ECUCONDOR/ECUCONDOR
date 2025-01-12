'use client';

import { Toaster } from '@/components/ui/toaster';

export default function CambioDivisasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0f1421]">
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
