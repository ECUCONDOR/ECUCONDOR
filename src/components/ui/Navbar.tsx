'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-900/80 to-red-800/80 backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-bold text-2xl bg-gradient-to-r from-red-400 via-yellow-400 to-red-400 text-transparent bg-clip-text hover:from-yellow-400 hover:via-red-400 hover:to-yellow-400 transition-all duration-300 transform hover:scale-105">
            ECUCONDOR S.A.S
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-white">Bienvenido, {user.name}</span>
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors animate-float"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-white hover:text-red-300 transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors animate-float"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
