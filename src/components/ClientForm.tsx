'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ClientFormData } from '@/types/onboarding';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Label } from './ui/label';

interface ClientFormProps {
  onSuccess?: (client: any) => void;
  onError?: (error: any) => void;
}

export function ClientForm({ onSuccess, onError }: ClientFormProps) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ClientFormData>();

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast.error('Cliente ya registrado', {
            description: result.error,
            action: {
              label: 'Entendido',
              onClick: () => console.log('Notificación cerrada')
            }
          });
          onError?.(result);
          return;
        }
        throw new Error(result.error || 'Error al crear el cliente');
      }

      if (result.client) {
        const successMessage = response.status === 201 
          ? 'Cliente creado exitosamente'
          : 'Cliente recuperado exitosamente';

        toast.success(successMessage, {
          description: `${result.client.first_name} ${result.client.last_name} ha sido ${response.status === 201 ? 'registrado' : 'encontrado'} en el sistema`,
          action: {
            label: 'Ver detalles',
            onClick: () => console.log('Ver detalles del cliente:', result.client)
          }
        });
        onSuccess?.(result.client);
      }
    } catch (error) {
      console.error('Error en el formulario:', error);
      toast.error('Error en el proceso', {
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Tipo de cliente</Label>
        <Select
          {...register('type', { required: 'El tipo de cliente es requerido' })}
          defaultValue="personal"
        >
          <option value="personal">Personal</option>
          <option value="business">Empresa</option>
        </Select>
        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="first_name">Nombre</Label>
        <Input
          {...register('first_name', { 
            required: 'El nombre es requerido',
            minLength: { value: 2, message: 'El nombre debe tener al menos 2 caracteres' }
          })}
          placeholder="Nombre"
        />
        {errors.first_name && (
          <p className="text-sm text-red-500">{errors.first_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="last_name">Apellido</Label>
        <Input
          {...register('last_name', { 
            required: 'El apellido es requerido',
            minLength: { value: 2, message: 'El apellido debe tener al menos 2 caracteres' }
          })}
          placeholder="Apellido"
        />
        {errors.last_name && (
          <p className="text-sm text-red-500">{errors.last_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="identification">Cédula/Pasaporte</Label>
        <Input
          {...register('identification', { 
            required: 'La identificación es requerida',
            pattern: {
              value: /^[0-9]{8,11}$/,
              message: 'Ingrese un número de identificación válido (8-11 dígitos)'
            }
          })}
          placeholder="Número de identificación"
        />
        {errors.identification && (
          <p className="text-sm text-red-500">{errors.identification.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          {...register('email', {
            required: 'El correo electrónico es requerido',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Ingrese un correo electrónico válido'
            }
          })}
          type="email"
          placeholder="correo@ejemplo.com"
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          {...register('phone', {
            required: 'El teléfono es requerido',
            pattern: {
              value: /^[0-9]{10,}$/,
              message: 'Ingrese un número de teléfono válido (mínimo 10 dígitos)'
            }
          })}
          placeholder="Número de teléfono"
        />
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Dirección (opcional)</Label>
        <Input
          {...register('address')}
          placeholder="Dirección completa"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={loading}
      >
        {loading ? 'Guardando...' : 'Guardar información'}
      </Button>
    </form>
  );
}
