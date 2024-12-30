'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { componentLoggers } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';

const { ui: logger } = componentLoggers;

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: NotificationType, title: string, message: string, data?: any) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((type: NotificationType, title: string, message: string, data?: any) => {
    const id = uuidv4();
    const timestamp = new Date();
    
    const newNotification: Notification = {
      id,
      type,
      title,
      message,
      timestamp,
      read: false,
      data
    };

    logger.info('Adding notification', {
      id,
      type,
      title,
      timestamp,
      data
    });

    setNotifications(prev => [newNotification, ...prev]);

    // Auto remove success and info notifications after 5 seconds
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    logger.info('Marking notification as read', { id });
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    logger.info('Marking all notifications as read');
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    logger.info('Removing notification', { id });
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    logger.info('Clearing all notifications');
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        unreadCount
      }}
    >
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {notifications
          .filter(n => !n.read)
          .slice(0, 5)
          .map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-lg max-w-sm backdrop-blur-lg ${
                notification.type === 'success' ? 'bg-green-500/90' :
                notification.type === 'error' ? 'bg-red-500/90' :
                notification.type === 'warning' ? 'bg-yellow-500/90' :
                'bg-blue-500/90'
              } text-white`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold">{notification.title}</h4>
                  <p className="text-sm mt-1">{notification.message}</p>
                  <p className="text-xs mt-2 opacity-75">
                    {notification.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-white/80 hover:text-white"
                    title="Marcar como leído"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="text-white/80 hover:text-white"
                    title="Cerrar"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
