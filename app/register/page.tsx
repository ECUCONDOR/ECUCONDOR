'use client';

import { Navbar } from '@/components/ui/Navbar';
import { Snowflakes } from '@/components/ui/Snowflakes';
import { ChampagneBubbles } from '@/components/ui/ChampagneBubbles';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-radial from-red-700 via-red-900 to-gray-900 relative overflow-hidden">
      <Navbar />
      <div className="relative z-10 container mx-auto px-4 py-8">
        <RegisterForm />
      </div>
      <Snowflakes />
      <ChampagneBubbles />
    </div>
  );
}
