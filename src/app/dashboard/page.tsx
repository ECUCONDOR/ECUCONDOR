'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, RefreshCcw, Users, Clock } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NewYearFireworks from '@/components/NewYearFireworks';

export default function DashboardPage() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/login');
    }
  }, [isLoading, user, router]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isLoading || isSigningOut) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-black text-white relative">
      <div className="absolute inset-0 pointer-events-none">
        <NewYearFireworks />
      </div>
      
      <div className="relative flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Background Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="text-[20vw] font-bold text-white/5 whitespace-nowrap transform -rotate-12 select-none animate-pulse">
            FELIZ 2025
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text">
            Dashboard
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 transition-all duration-300"
            >
              {isSigningOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Saldo Total
              </CardTitle>
              <Wallet className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">$45,231.89</div>
              <p className="text-xs text-gray-400">
                +20.1% respecto al mes anterior
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Transacciones
              </CardTitle>
              <RefreshCcw className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">+573</div>
              <p className="text-xs text-gray-400">
                +201 transacciones esta semana
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Usuarios Activos
              </CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">+2350</div>
              <p className="text-xs text-gray-400">
                +180.1% respecto al mes anterior
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Tiempo Promedio
              </CardTitle>
              <Clock className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">12.4h</div>
              <p className="text-xs text-gray-400">
                -19% respecto al mes anterior
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/exchange" className="block">
            <Card className="bg-white/5 border-white/10 backdrop-blur-lg hover:bg-white/10 transition-all duration-300 cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-300">
                  Cambio de Divisas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400">
                  Realiza cambios de divisas de manera rápida y segura
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/p2p" className="block">
            <Card className="bg-white/5 border-white/10 backdrop-blur-lg hover:bg-white/10 transition-all duration-300 cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-300">
                  P2P
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400">
                  Intercambia directamente con otros usuarios
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/payments" className="block">
            <Card className="bg-white/5 border-white/10 backdrop-blur-lg hover:bg-white/10 transition-all duration-300 cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-300">
                  Pagos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400">
                  Realiza y recibe pagos internacionales
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile" className="block">
            <Card className="bg-white/5 border-white/10 backdrop-blur-lg hover:bg-white/10 transition-all duration-300 cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-300">
                  Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400">
                  Administra tu información personal
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}