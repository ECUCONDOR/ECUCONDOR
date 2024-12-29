'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  DollarSign, 
  FileText, 
  User, 
  Settings,
  CreditCard,
  History
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Inicio', icon: Home },
    { href: '/exchange', label: 'Cambio', icon: DollarSign },
    { href: '/documents', label: 'Documentos', icon: FileText },
    { href: '/profile', label: 'Perfil', icon: User },
    { href: '/payments', label: 'Pagos', icon: CreditCard },
    { href: '/history', label: 'Historial', icon: History },
    { href: '/settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <nav className={`flex flex-col gap-4 p-4 ${className}`}>
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 p-2 rounded-lg transition-colors
              ${isActive 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
              }`}
          >
            <Icon className="w-5 h-5" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}