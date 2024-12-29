'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!acceptedTerms) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes aceptar los términos y condiciones",
        });
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error al registrarse",
          description: error.message,
        });
        return;
      }

      toast({
        title: "Registro exitoso",
        description: "Por favor verifica tu correo electrónico",
      });

      router.push('/auth/login');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error inesperado",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1E2026] p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Image
            src="/images/image.svg"
            alt="ECUCONDOR Logo"
            width={150}
            height={150}
            className="mx-auto"
          />
          <h2 className="mt-6 text-3xl font-bold text-white">
            Crear una cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/auth/login" className="text-yellow-400 hover:text-yellow-300">
              Iniciar sesión
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#2B2F36] border-[#40444C] text-white placeholder-gray-400"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#2B2F36] border-[#40444C] text-white placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              className="border-[#40444C] data-[state=checked]:bg-yellow-400"
            />
            <label
              htmlFor="terms"
              className="text-sm text-gray-400 cursor-pointer"
            >
              Acepto los{' '}
              <Link href="/terms" className="text-yellow-400 hover:text-yellow-300">
                términos y condiciones
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold h-12"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2" />
                Registrando...
              </span>
            ) : (
              'Registrarse'
            )}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#40444C]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#1E2026] text-gray-400">
                O continuar con
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              type="button"
              className="bg-[#2B2F36] hover:bg-[#363B44] text-white"
              onClick={() => {/* Handle Google Sign In */}}
            >
              <Image
                src="/google.svg"
                alt="Google"
                width={20}
                height={20}
                className="mr-2"
              />
              Google
            </Button>
            <Button
              type="button"
              className="bg-[#2B2F36] hover:bg-[#363B44] text-white"
              onClick={() => {/* Handle Apple Sign In */}}
            >
              <Image
                src="/apple.svg"
                alt="Apple"
                width={20}
                height={20}
                className="mr-2"
              />
              Apple
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
