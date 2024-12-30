'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export function NotificationCenter() {
  // Usamos el contexto actualizado que maneja la integración con la API
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  // Manejador para marcar una notificación como leída
  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id.toString()); 
    } catch (error) {
      toast.error('No se pudo marcar la notificación como leída');
    }
  };

  // Manejador para marcar todas las notificaciones como leídas
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setIsOpen(false);
    } catch (error) {
      toast.error('No se pudieron marcar todas las notificaciones como leídas');
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative" size="icon">
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Notificaciones</p>
            <p className="text-xs leading-none text-muted-foreground">
              {unreadCount === 0 ? 'No hay notificaciones nuevas' : `${unreadCount} notificaciones sin leer`}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No hay notificaciones
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-4 ${
                  !notification.read ? 'bg-yellow-500/5' : ''
                }`}
                onSelect={(e) => {
                  e.preventDefault();
                  if (!notification.read) {
                    handleMarkAsRead(notification.id);
                  }
                }}
              >
                <div className="flex w-full justify-between items-start mb-1">
                  <span className="font-medium">{notification.title}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {notification.message}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(notification.timestamp), { 
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
        {notifications.length > 0 && unreadCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-center text-sm"
              onSelect={handleMarkAllAsRead}
            >
              Marcar todas como leídas
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}