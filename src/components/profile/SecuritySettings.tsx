'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createBrowserClient } from '@supabase/ssr';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Key, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SecuritySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: 'Contraseña actualizada',
        description: 'Tu contraseña ha sido actualizada exitosamente',
      });
      
      // Limpiar campos
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la contraseña',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    // Aquí iría la lógica para habilitar/deshabilitar 2FA
    toast({
      title: 'Próximamente',
      description: 'La autenticación de dos factores estará disponible pronto',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="mr-2 h-5 w-5" />
            Cambiar Contraseña
          </CardTitle>
          <CardDescription>
            Actualiza tu contraseña regularmente para mantener tu cuenta segura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Contraseña Actual</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva Contraseña</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar Contraseña'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Autenticación de Dos Factores
          </CardTitle>
          <CardDescription>
            Añade una capa extra de seguridad a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Autenticación de Dos Factores</p>
              <p className="text-sm text-gray-500">
                Protege tu cuenta con autenticación de dos factores
              </p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={handleTwoFactorToggle}
              disabled
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
