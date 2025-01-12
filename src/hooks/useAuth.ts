'use client';

import { useContext } from 'react';
import { AuthContext } from '@/contexts/auth-context';
import type { AuthContextProps } from '@/contexts/auth-context';

export function useAuth(): AuthContextProps {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
