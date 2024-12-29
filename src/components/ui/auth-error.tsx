'use client';

import { XCircle } from 'lucide-react';

interface AuthErrorProps {
  message: string;
}

export function AuthError({ message }: AuthErrorProps) {
  if (!message) return null;

  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-500">
            Error de autenticación
          </h3>
          <div className="mt-1 text-sm text-red-400">
            {message}
          </div>
        </div>
      </div>
    </div>
  );
}
