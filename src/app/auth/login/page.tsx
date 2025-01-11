'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PublicNavbar } from '@/components/public-navbar';
import { useNotifications } from '@/contexts/NotificationContext';
import NewYearFireworks from '@/components/NewYearFireworks';
import Image from 'next/image';

const LoginForm = dynamic(() => Promise.resolve(LoginFormContent), {
  ssr: false
});

function LoginFormContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Error de inicio de sesión',
          description: error.message,
          variant: 'destructive',
        });
        addNotification({
          type: 'error',
          title: 'Error de acceso',
          message: 'No se pudo iniciar sesión. Verifica tus credenciales.'
        });
        return;
      }

      if (data?.user) {
        toast({
          title: 'Bienvenido',
          description: 'Has iniciado sesión correctamente',
          variant: 'default',
        });
        addNotification({
          type: 'success',
          title: 'Bienvenido',
          message: 'Has iniciado sesión correctamente'
        });
        router.refresh();
        await new Promise(resolve => setTimeout(resolve, 100));
        router.push('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ocurrió un error al iniciar sesión. Por favor, intenta nuevamente.',
        variant: 'destructive',
      });
      addNotification({
        type: 'error',
        title: 'Error de acceso',
        message: 'No se pudo iniciar sesión. Verifica tus credenciales.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 bg-white/5 p-8 rounded-lg backdrop-blur-md border border-white/10">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text">
          Iniciar Sesión
        </h2>
        <p className="text-gray-400">
          Ingresa tus credenciales para continuar
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-300">
            Email
          </label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            placeholder="tu@email.com"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-300">
            Contraseña
          </label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            placeholder="••••••••"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 transform hover:scale-105"
      >
        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </Button>

      <div className="text-center text-sm text-gray-400">
        ¿No tienes una cuenta?{' '}
        <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 transition-colors">
          Regístrate aquí
        </Link>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-blue-950 via-blue-900 to-black text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <NewYearFireworks />
      </div>
      <PublicNavbar />
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <div className="text-center mb-6">
          <Image
            src="/images/image.svg"
            alt="ECUCONDOR Logo"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-white">Bienvenido a ECUCONDOR</h2>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
