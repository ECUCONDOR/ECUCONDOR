'use client'

import { useState } from 'react'
import { useUserClientRelation } from '@/hooks/useUserClientRelation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ClientFormData } from '@/types/onboarding'
import { Loader2 } from 'lucide-react'

interface ClientSelectionStepProps {
  onNextAction: (clientId: number) => void;
}

export default function ClientSelectionStep({ onNextAction }: ClientSelectionStepProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    first_name: '',
    last_name: '',
    name: '',
    identification: '',
    email: '',
    phone: '',
    type: 'personal',
    address: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.identification?.trim()) {
      newErrors.identification = 'La identificación es requerida';
    } else if (formData.identification.length < 10) {
      newErrors.identification = 'La identificación debe tener al menos 10 caracteres';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Correo electrónico inválido';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (formData.phone.length < 10) {
      newErrors.phone = 'El teléfono debe tener al menos 10 dígitos';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          toast({
            title: "Error de autenticación",
            description: "Por favor, inicie sesión nuevamente.",
            variant: "destructive"
          });
          // Optionally redirect to login page or refresh the session
          return;
        }
        throw new Error(errorData.error || 'Error al procesar la solicitud');
      }

      const data = await response.json();
      
      if (data.client?.id) {
        onNextAction(data.client.id);
        toast({
          title: data.isExisting ? "Cliente existente" : "Cliente creado",
          description: data.isExisting 
            ? "Se ha vinculado al cliente existente."
            : "Se ha creado el cliente exitosamente.",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error inesperado",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="type">Tipo de cliente</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'personal' | 'business' }))}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="business">Empresa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={errors.name ? 'border-red-500' : ''}
              autoComplete="name"
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="identification">Cédula/Pasaporte</Label>
            <Input
              id="identification"
              value={formData.identification}
              onChange={(e) => setFormData(prev => ({ ...prev, identification: e.target.value }))}
              className={errors.identification ? 'border-red-500' : ''}
            />
            {errors.identification && <p className="text-sm text-red-500 mt-1">{errors.identification}</p>}
          </div>

          <div>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={errors.email ? 'border-red-500' : ''}
              autoComplete="email"
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className={errors.phone ? 'border-red-500' : ''}
              autoComplete="tel"
            />
            {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <Label htmlFor="address">Dirección (opcional)</Label>
            <Input
              id="address"
              value={formData.address || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              autoComplete="street-address"
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar información'
          )}
        </Button>
      </form>
    </Card>
  )
}