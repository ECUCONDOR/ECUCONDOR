'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Snowflakes } from '../ui/Snowflakes';
import { ChampagneBubbles } from '../ui/ChampagneBubbles';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      // El error ya está manejado en el contexto
      console.error('Error en el inicio de sesión:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-radial from-red-700 via-red-900 to-gray-900 relative overflow-hidden">
      <Snowflakes />
      <ChampagneBubbles />
      
      <div className="bg-white/10 p-8 rounded-lg shadow-xl backdrop-blur-md w-96 relative z-10">
        <h2 className="text-3xl font-bold mb-6 text-white text-center text-shadow-xl">
          Iniciar Sesión
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/50 text-white rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full p-3 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition-colors duration-200 animate-float"
          >
            Ingresar
          </button>
        </form>
        
        <p className="mt-4 text-center text-white">
          ¿No tienes una cuenta?{' '}
          <Link href="/register" className="text-red-400 hover:text-red-300">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
