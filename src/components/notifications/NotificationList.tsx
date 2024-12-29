'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Bell, CheckCircle, AlertCircle, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const supabase = createClient()

interface Notification {
  id: string
  tipo: string
  mensaje: string
  leida: boolean
  created_at: string
  detalles?: any
}

export default function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    loadNotifications()
    subscribeToNotifications()
  }, [])

  const loadNotifications = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) {
      setNotifications(data)
    }
  }

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificaciones'
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('id', notificationId)

    if (!error) {
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, leida: true } : notif
        )
      )
    }
  }

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'DEPOSITO_CONFIRMADO':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'DEPOSITO_PENDIENTE':
        return <CreditCard className="w-5 h-5 text-yellow-500" />
      case 'ERROR':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Bell className="w-5 h-5 text-blue-500" />
    }
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`cursor-pointer transition-colors ${
            !notification.leida ? 'bg-blue-50' : ''
          }`}
          onClick={() => markAsRead(notification.id)}
        >
          <CardContent className="flex items-start p-4 gap-3">
            {getNotificationIcon(notification.tipo)}
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.mensaje}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(notification.created_at), 'PPp', { locale: es })}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
      {notifications.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No tienes notificaciones
        </div>
      )}
    </div>
  )
}
