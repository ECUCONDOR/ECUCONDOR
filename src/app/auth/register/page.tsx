'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@supabase/supabase-js';
import { PublicNavbar } from '@/components/public-navbar';
import { useNotifications } from '@/contexts/NotificationContext';
import NewYearFireworks from '@/components/NewYearFireworks';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    country: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      setError('Debes aceptar los términos de servicio');
      addNotification(
        'warning',
        'Términos de servicio',
        'Debes aceptar los términos de servicio para continuar'
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      addNotification(
        'error',
        'Error de validación',
        'Las contraseñas ingresadas no coinciden'
      );
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            country: formData.country,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data) {
        toast({
          title: 'Registro exitoso',
          description: 'Tu cuenta ha sido creada correctamente. Por favor, verifica tu correo electrónico.',
          variant: 'default',
        });
        addNotification(
          'success',
          'Registro exitoso',
          'Tu cuenta ha sido creada correctamente. Por favor, verifica tu correo electrónico.'
        );
        router.push('/auth/login');
      }
    } catch (error: any) {
      setError(error.message);
      toast({
        title: 'Error de registro',
        description: error.message,
        variant: 'destructive',
      });
      addNotification(
        'error',
        'Error de registro',
        error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-blue-950 via-blue-900 to-black text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <NewYearFireworks />
      </div>
      <PublicNavbar />
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md space-y-6 bg-white/5 p-8 rounded-lg backdrop-blur-md border border-white/10">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text">
              Crear Cuenta
            </h2>
            <p className="text-gray-400">
              Únete a la comunidad de ECUCONDOR
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-gray-300">
                Nombre completo
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                placeholder="Juan Pérez"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                placeholder="tu@email.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="country" className="text-sm font-medium text-gray-300">
                País
              </label>
              <Input
                id="country"
                name="country"
                type="text"
                required
                value={formData.country}
                onChange={handleChange}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                placeholder="Argentina"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-300">
                Contraseña
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
                Confirmar contraseña
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                className="border-white/20 data-[state=checked]:bg-blue-500"
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Acepto los términos y condiciones
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>

            <div className="text-center text-sm text-gray-400">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                Inicia sesión aquí
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
