'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { createBrowserClient } from '@supabase/ssr';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save } from 'lucide-react';

export default function GeneralSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    language: 'es',
    timezone: 'America/Guayaquil',
    currency: 'USD',
    dateFormat: 'DD/MM/YYYY',
    enableDarkMode: true,
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleChange = (name: string, value: string | boolean) => {
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
        .from('user_settings')
        .upsert({
          user_id: user?.id,
          settings: settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Configuraciones actualizadas',
        description: 'Tus preferencias han sido guardadas exitosamente',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron guardar las configuraciones',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="language">Idioma</Label>
          <Select
            value={settings.language}
            onValueChange={(value) => handleChange('language', value)}
          >
            <SelectTrigger id="language">
              <SelectValue placeholder="Selecciona un idioma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="pt">Português</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Zona Horaria</Label>
          <Select
            value={settings.timezone}
            onValueChange={(value) => handleChange('timezone', value)}
          >
            <SelectTrigger id="timezone">
              <SelectValue placeholder="Selecciona una zona horaria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/Guayaquil">Ecuador (GMT-5)</SelectItem>
              <SelectItem value="America/Buenos_Aires">Argentina (GMT-3)</SelectItem>
              <SelectItem value="America/Sao_Paulo">Brasil (GMT-3)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Moneda Principal</Label>
          <Select
            value={settings.currency}
            onValueChange={(value) => handleChange('currency', value)}
          >
            <SelectTrigger id="currency">
              <SelectValue placeholder="Selecciona una moneda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
              <SelectItem value="ARS">ARS - Peso Argentino</SelectItem>
              <SelectItem value="BRL">BRL - Real Brasileño</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateFormat">Formato de Fecha</Label>
          <Select
            value={settings.dateFormat}
            onValueChange={(value) => handleChange('dateFormat', value)}
          >
            <SelectTrigger id="dateFormat">
              <SelectValue placeholder="Selecciona un formato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="darkMode">Modo Oscuro</Label>
            <p className="text-sm text-gray-500">
              Activa el modo oscuro para una mejor visualización nocturna
            </p>
          </div>
          <Switch
            id="darkMode"
            checked={settings.enableDarkMode}
            onCheckedChange={(checked) => handleChange('enableDarkMode', checked)}
          />
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
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
