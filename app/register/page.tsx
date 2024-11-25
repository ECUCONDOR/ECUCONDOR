'use client';

import { RegistrationForm } from '@/components/registration/RegistrationForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001F3F] to-[#003366] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-cyan-400 to-pink-500">
          Registro y Cotización
        </h1>
        <RegistrationForm />
      </div>
    </div>
  );
}
