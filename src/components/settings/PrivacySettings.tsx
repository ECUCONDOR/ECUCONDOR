'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { createBrowserClient } from '@supabase/ssr';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, Lock, Eye, Shield, UserPlus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'contacts';
  activityVisibility: 'public' | 'private' | 'contacts';
  showOnlineStatus: boolean;
  allowContactRequests: boolean;
  allowDataCollection: boolean;
  enableTwoFactor: boolean;
  sessionTimeout: '15' | '30' | '60' | 'never';
}

export default function PrivacySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'contacts',
    activityVisibility: 'contacts',
    showOnlineStatus: true,
    allowContactRequests: true,
    allowDataCollection: true,
    enableTwoFactor: false,
    sessionTimeout: '30',
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleChange = (name: keyof PrivacySettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('privacy_settings')
        .upsert({
          user_id: user?.id,
          settings: settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Configuración de privacidad actualizada',
        description: 'Tus preferencias de privacidad han sido guardadas exitosamente',
      });
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron guardar las configuraciones de privacidad',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Visibilidad del Perfil
          </h3>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profileVisibility">¿Quién puede ver tu perfil?</Label>
              <Select
                value={settings.profileVisibility}
                onValueChange={(value: string) => {
                  if (value === 'public' || value === 'private' || value === 'contacts') {
                    handleChange('profileVisibility', value);
                  }
                }}
              >
                <SelectTrigger id="profileVisibility">
                  <SelectValue placeholder="Selecciona la visibilidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Todos</SelectItem>
                  <SelectItem value="contacts">Solo Contactos</SelectItem>
                  <SelectItem value="private">Solo Yo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activityVisibility">¿Quién puede ver tu actividad?</Label>
              <Select
                value={settings.activityVisibility}
                onValueChange={(value: string) => {
                  if (value === 'public' || value === 'private' || value === 'contacts') {
                    handleChange('activityVisibility', value);
                  }
                }}
              >
                <SelectTrigger id="activityVisibility">
                  <SelectValue placeholder="Selecciona la visibilidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Todos</SelectItem>
                  <SelectItem value="contacts">Solo Contactos</SelectItem>
                  <SelectItem value="private">Solo Yo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Conexiones
          </h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="showOnlineStatus">Mostrar Estado en Línea</Label>
                <p className="text-sm text-gray-500">
                  Permitir que otros vean cuando estás activo
                </p>
              </div>
              <Switch
                id="showOnlineStatus"
                checked={settings.showOnlineStatus}
                onCheckedChange={(checked) => handleChange('showOnlineStatus', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowContactRequests">Solicitudes de Contacto</Label>
                <p className="text-sm text-gray-500">
                  Permitir que otros usuarios te envíen solicitudes de contacto
                </p>
              </div>
              <Switch
                id="allowContactRequests"
                checked={settings.allowContactRequests}
                onCheckedChange={(checked) => handleChange('allowContactRequests', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Seguridad
          </h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableTwoFactor">Autenticación de Dos Factores</Label>
                <p className="text-sm text-gray-500">
                  Añade una capa extra de seguridad a tu cuenta
                </p>
              </div>
              <Switch
                id="enableTwoFactor"
                checked={settings.enableTwoFactor}
                onCheckedChange={(checked) => handleChange('enableTwoFactor', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Tiempo de Inactividad</Label>
              <Select
                value={settings.sessionTimeout}
                onValueChange={(value: string) => {
                  if (value === '15' || value === '30' || value === '60' || value === 'never') {
                    handleChange('sessionTimeout', value);
                  }
                }}
              >
                <SelectTrigger id="sessionTimeout">
                  <SelectValue placeholder="Selecciona el tiempo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="never">Nunca</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium flex items-center">
            <Lock className="h-5 w-5 mr-2" />
            Datos y Privacidad
          </h3>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowDataCollection">Recopilación de Datos</Label>
                <p className="text-sm text-gray-500">
                  Permitir la recopilación de datos para mejorar el servicio
                </p>
              </div>
              <Switch
                id="allowDataCollection"
                checked={settings.allowDataCollection}
                onCheckedChange={(checked) => handleChange('allowDataCollection', checked)}
              />
            </div>
          </div>
        </div>
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
              Guardar Configuración
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
