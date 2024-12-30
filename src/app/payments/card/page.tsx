'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Session } from '@supabase/supabase-js';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { PaymentService } from '@/services/payment.service';

interface FormularioTarjeta {
  cardNumber: string;
  expiry: string;
  cvv: string;
  name: string;
  amount: string;
}

export default function PagoTarjeta() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormularioTarjeta>({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: '',
    amount: ''
  });

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      if (!currentSession) {
        router.push('/auth/login');
      }
    };

    checkSession();
  }, [supabase, router]);

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    return params.toString();
  };

  // Formateadores de entrada
  const formatearNumeroTarjeta = (valor: string): string => {
    const soloNumeros = valor.replace(/\D/g, '');
    const grupos = soloNumeros.match(/.{1,4}/g) || [];
    return grupos.join(' ').substr(0, 19);
  };

  const formatearExpiracion = (valor: string): string => {
    const soloNumeros = valor.replace(/\D/g, '');
    if (soloNumeros.length >= 2) {
      return `${soloNumeros.slice(0, 2)}/${soloNumeros.slice(2, 4)}`;
    }
    return soloNumeros;
  };

  const formatearCVV = (valor: string): string => {
    return valor.replace(/\D/g, '').slice(0, 4);
  };

  const formatearMonto = (valor: string): string => {
    const soloNumeros = valor.replace(/[^\d.]/g, '');
    const partes = soloNumeros.split('.');
    if (partes.length > 2) return valor;
    if (partes[1]?.length > 2) return valor;
    return soloNumeros;
  };

  // Manejador de cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let valorFormateado = value;

    switch (name) {
      case 'cardNumber':
        valorFormateado = formatearNumeroTarjeta(value);
        break;
      case 'expiry':
        valorFormateado = formatearExpiracion(value);
        break;
      case 'cvv':
        valorFormateado = formatearCVV(value);
        break;
      case 'amount':
        valorFormateado = formatearMonto(value);
        break;
    }

    setFormData(prev => ({
      ...prev,
      [name]: valorFormateado
    }));
  };

  // Manejador de envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!session) {
        throw new Error('Debe iniciar sesión para realizar pagos');
      }

      // Validaciones adicionales del frontend
      if (!formData.cardNumber || !formData.expiry || !formData.cvv || !formData.name || !formData.amount) {
        throw new Error('Todos los campos son obligatorios');
      }

      const monto = parseFloat(formData.amount);
      if (isNaN(monto) || monto <= 0) {
        throw new Error('Monto inválido');
      }

      // Procesar pago
      const resultado = await PaymentService.procesarPagoTarjeta({
        numeroTarjeta: formData.cardNumber.replace(/\s/g, ''),
        expiracion: formData.expiry,
        cvv: formData.cvv,
        titular: formData.name,
        monto
      });

      // Redireccionar a página de éxito
      const queryString = createQueryString('id', resultado.id);
      router.push('/payments/success' + (queryString ? `?${queryString}` : '') as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              Debe iniciar sesión para realizar pagos
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Pago con Tarjeta</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2">Número de Tarjeta</label>
            <Input
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              disabled={loading}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Fecha de Expiración</label>
              <Input
                name="expiry"
                value={formData.expiry}
                onChange={handleChange}
                placeholder="MM/YY"
                maxLength={5}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block mb-2">CVV</label>
              <Input
                name="cvv"
                value={formData.cvv}
                onChange={handleChange}
                placeholder="123"
                maxLength={4}
                type="password"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-2">Nombre del Titular</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Como aparece en la tarjeta"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block mb-2">Monto (USD)</label>
            <Input
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              disabled={loading}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Procesando...' : 'Realizar Pago'}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
