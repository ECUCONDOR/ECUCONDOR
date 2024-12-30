'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { createBrowserClient } from '@supabase/ssr';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, Layout, Monitor, Palette, Sun, Moon, Laptop } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface PreferenceSettings {
  theme: 'light' | 'dark' | 'system';
  colorScheme: 'blue' | 'green' | 'purple' | 'orange';
  compactMode: boolean;
  sidebarCollapsed: boolean;
  enableAnimations: boolean;
  dashboardLayout: 'grid' | 'list';
  defaultView: 'month' | 'week' | 'day';
  showWeekends: boolean;
}

export default function PreferenceSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<PreferenceSettings>({
    theme: 'system',
    colorScheme: 'blue',
    compactMode: false,
    sidebarCollapsed: false,
    enableAnimations: true,
    dashboardLayout: 'grid',
    defaultView: 'month',
    showWeekends: true,
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleChange = (name: keyof PreferenceSettings, value: any) => {
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
        .from('user_preferences')
        .upsert({
          user_id: user?.id,
          preferences: settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Preferencias actualizadas',
        description: 'Tus preferencias han sido guardadas exitosamente',
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
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
        <div>
          <h3 className="text-lg font-medium flex items-center">
            <Monitor className="h-5 w-5 mr-2" />
            Apariencia
          </h3>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>Tema</Label>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  type="button"
                  variant={settings.theme === 'light' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => handleChange('theme', 'light')}
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Claro
                </Button>
                <Button
                  type="button"
                  variant={settings.theme === 'dark' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => handleChange('theme', 'dark')}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Oscuro
                </Button>
                <Button
                  type="button"
                  variant={settings.theme === 'system' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => handleChange('theme', 'system')}
                >
                  <Laptop className="h-4 w-4 mr-2" />
                  Sistema
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="colorScheme">Esquema de Color</Label>
              <Select
                value={settings.colorScheme}
                onValueChange={(value: string) => {
                  if (value === 'blue' || value === 'green' || value === 'purple' || value === 'orange') {
                    handleChange('colorScheme', value);
                  }
                }}
              >
                <SelectTrigger id="colorScheme">
                  <SelectValue placeholder="Selecciona un esquema de color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Azul</SelectItem>
                  <SelectItem value="green">Verde</SelectItem>
                  <SelectItem value="purple">Púrpura</SelectItem>
                  <SelectItem value="orange">Naranja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium flex items-center">
            <Layout className="h-5 w-5 mr-2" />
            Diseño
          </h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="compactMode">Modo Compacto</Label>
                <p className="text-sm text-gray-500">
                  Reduce el espacio entre elementos
                </p>
              </div>
              <Switch
                id="compactMode"
                checked={settings.compactMode}
                onCheckedChange={(checked) => handleChange('compactMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sidebarCollapsed">Barra Lateral Colapsada</Label>
                <p className="text-sm text-gray-500">
                  Inicia con la barra lateral colapsada
                </p>
              </div>
              <Switch
                id="sidebarCollapsed"
                checked={settings.sidebarCollapsed}
                onCheckedChange={(checked) => handleChange('sidebarCollapsed', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableAnimations">Animaciones</Label>
                <p className="text-sm text-gray-500">
                  Habilitar animaciones en la interfaz
                </p>
              </div>
              <Switch
                id="enableAnimations"
                checked={settings.enableAnimations}
                onCheckedChange={(checked) => handleChange('enableAnimations', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dashboardLayout">Diseño del Dashboard</Label>
              <Select
                value={settings.dashboardLayout}
                onValueChange={(value: string) => {
                  if (value === 'grid' || value === 'list') {
                    handleChange('dashboardLayout', value);
                  }
                }}
              >
                <SelectTrigger id="dashboardLayout">
                  <SelectValue placeholder="Selecciona un diseño" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Cuadrícula</SelectItem>
                  <SelectItem value="list">Lista</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium flex items-center">
            <Palette className="h-5 w-5 mr-2" />
            Calendario
          </h3>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultView">Vista Predeterminada</Label>
              <Select
                value={settings.defaultView}
                onValueChange={(value: string) => {
                  if (value === 'month' || value === 'week' || value === 'day') {
                    handleChange('defaultView', value);
                  }
                }}
              >
                <SelectTrigger id="defaultView">
                  <SelectValue placeholder="Selecciona una vista" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Mes</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="day">Día</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="showWeekends">Mostrar Fines de Semana</Label>
                <p className="text-sm text-gray-500">
                  Incluir sábados y domingos en la vista
                </p>
              </div>
              <Switch
                id="showWeekends"
                checked={settings.showWeekends}
                onCheckedChange={(checked) => handleChange('showWeekends', checked)}
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
              Guardar Preferencias
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
