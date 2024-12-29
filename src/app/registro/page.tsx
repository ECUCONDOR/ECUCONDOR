'use client';

import React from 'react';
import RegisterForm from '@/components/auth/RegisterForm';
import SignInWithGoogle from '@/components/SignInWithGoogle';
import AnimatedBackground from '@/components/AnimatedBackground';
import Link from 'next/link';

export default function RegistroPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <AnimatedBackground />
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-xl w-full max-w-md z-10">
        <h1 className="text-3xl font-bold text-center mb-8">Crear Cuenta</h1>
        <RegisterForm />
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">O continuar con</span>
            </div>
          </div>
          <div className="mt-6">
            <SignInWithGoogle />
          </div>
        </div>
        <div className="mt-6 text-center text-sm">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
