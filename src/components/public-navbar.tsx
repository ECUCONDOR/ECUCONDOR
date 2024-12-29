'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { NotificationCenter } from './NotificationCenter';
import { useAuth } from '@/hooks/useAuth';

export function PublicNavbar() {
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/image.svg"
              alt="ECUCONDOR Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="font-bold text-xl">ECUCONDOR</span>
          </Link>

          <div className="flex items-center space-x-4">
            <NotificationCenter />
            {!user ? (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Iniciar Sesión</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Registrarse</Button>
                </Link>
              </>
            ) : (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default PublicNavbar;
