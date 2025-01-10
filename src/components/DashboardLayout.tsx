'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/use-toast';
import type { Route } from 'next';
import {
  Home,
  User,
  Wallet,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Repeat2,
  Users,
} from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';

interface NavItem {
  href: Route;
  icon: React.ReactNode;
  label: string;
  group?: string;
}

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems: NavItem[] = [
    // Grupo Principal
    { href: '/dashboard' as Route, icon: <Home size={20} />, label: 'Panel Principal', group: 'main' },
    { href: '/profile' as Route, icon: <User size={20} />, label: 'Mi Cuenta', group: 'main' },
    
    // Grupo Financiero
    { href: '/payments' as Route, icon: <Wallet size={20} />, label: 'Billetera Digital', group: 'financial' },
    { href: '/transactions' as Route, icon: <FileText size={20} />, label: 'Mis Movimientos', group: 'financial' },
    { href: '/exchange' as Route, icon: <Repeat2 size={20} />, label: 'Cripto Exchange', group: 'financial' },
    { href: '/p2p' as Route, icon: <Users size={20} />, label: 'Cambio de Divisas', group: 'financial' },
    { href: '/operations' as Route, icon: <BarChart2 size={20} />, label: 'Estado de Cuenta', group: 'financial' },
    
    // Grupo Configuración
    { href: '/settings' as Route, icon: <Settings size={20} />, label: 'Configuración', group: 'settings' },
  ];

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      toast({
        title: 'Cerrando sesión',
        description: 'Por favor espere...',
      });
      
      await signOut();
      
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión exitosamente',
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cerrar la sesión. Por favor, intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen transition-transform bg-gray-900',
          isSidebarOpen ? 'w-64' : 'w-16',
          'border-r border-gray-800'
        )}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-5">
            <Link
              href={'/dashboard' as Route}
              className={cn(
                'flex items-center',
                !isSidebarOpen && 'justify-center'
              )}
            >
              {isSidebarOpen ? (
                <span className="self-center text-xl font-semibold text-white">
                  ECUCONDOR
                </span>
              ) : (
                <span className="self-center text-xl font-semibold text-white">
                  EC
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded-lg text-gray-400 hover:bg-gray-800"
            >
              {isSidebarOpen ? (
                <ChevronLeft size={20} />
              ) : (
                <ChevronRight size={20} />
              )}
            </button>
          </div>

          <ul className="space-y-2 font-medium">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center p-2 rounded-lg text-white hover:bg-gray-800',
                    pathname === item.href && 'bg-yellow-500/10 text-yellow-500',
                    !isSidebarOpen && 'justify-center'
                  )}
                >
                  {item.icon}
                  {isSidebarOpen && (
                    <span className="ml-3">{item.label}</span>
                  )}
                </Link>
              </li>
            ))}

            <li className="mt-auto pt-4 border-t border-gray-800">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={cn(
                  'flex items-center w-full p-2 text-gray-400 rounded-lg hover:bg-gray-800 group transition-colors',
                  isLoggingOut && 'opacity-50 cursor-not-allowed'
                )}
              >
                <LogOut size={20} className="text-red-500" />
                {isSidebarOpen && (
                  <span className="ml-3 text-red-500">
                    {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                  </span>
                )}
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          'transition-all duration-200 ease-in-out min-h-screen bg-[#000B1F]',
          isSidebarOpen ? 'ml-64' : 'ml-16'
        )}
      >
        <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-black/50 backdrop-blur-sm">
          <div className="container flex h-16 items-center justify-end space-x-4 px-4">
            <NotificationCenter />
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
