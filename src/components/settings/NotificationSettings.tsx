'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createBrowserClient } from '@supabase/ssr';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Bell, Mail, Phone } from 'lucide-react';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

export default function NotificationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'security',
      title: 'Alertas de Seguridad',
      description: 'Notificaciones sobre inicios de sesión y cambios en la cuenta',
      email: true,
      push: true,
      sms: true,
    },
    {
      id: 'transactions',
      title: 'Transacciones',
      description: 'Actualizaciones sobre tus transacciones y pagos',
      email: true,
      push: true,
      sms: false,
    },
    {
      id: 'promotions',
      title: 'Promociones y Noticias',
      description: 'Ofertas especiales y actualizaciones del servicio',
      email: true,
      push: false,
      sms: false,
    },
    {
      id: 'account',
      title: 'Estado de la Cuenta',
      description: 'Actualizaciones sobre el estado de tu cuenta y verificaciones',
      email: true,
      push: true,
      sms: true,
    },
  ]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleToggle = (settingId: string, channel: 'email' | 'push' | 'sms', value: boolean) => {
    setSettings(prev =>
      prev.map(setting =>
        setting.id === settingId
          ? { ...setting, [channel]: value }
          : setting
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user?.id,
          settings: settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Preferencias de notificación actualizadas',
        description: 'Tus preferencias han sido guardadas exitosamente',
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron guardar las preferencias',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        {settings.map((setting) => (
          <div key={setting.id} className="border-b border-gray-800 pb-6 last:border-0">
            <div className="mb-4">
              <h3 className="text-lg font-medium">{setting.title}</h3>
              <p className="text-sm text-gray-500">{setting.description}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id={`${setting.id}-email`}
                  checked={setting.email}
                  onCheckedChange={(checked) => handleToggle(setting.id, 'email', checked)}
                />
                <Label htmlFor={`${setting.id}-email`} className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id={`${setting.id}-push`}
                  checked={setting.push}
                  onCheckedChange={(checked) => handleToggle(setting.id, 'push', checked)}
                />
                <Label htmlFor={`${setting.id}-push`} className="flex items-center">
                  <Bell className="h-4 w-4 mr-2" />
                  Push
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id={`${setting.id}-sms`}
                  checked={setting.sms}
                  onCheckedChange={(checked) => handleToggle(setting.id, 'sms', checked)}
                />
                <Label htmlFor={`${setting.id}-sms`} className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  SMS
                </Label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Preferencias
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
