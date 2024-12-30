'use client';

import { useState, useCallback, ChangeEvent } from 'react';
import { Session } from '@supabase/supabase-js';
import { PaymentService } from '@/services/payment.service';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AccountType,
  BankFormFields,
  BankFormState,
  ValidationErrors,
  ValidationResult,
  initialBankFormState,
  isValidBankFormField
} from './types/bankForm';

interface BankTransferFormProps {
  session: Session;
}

interface FormState {
  data: BankFormFields;
  isSubmitting: boolean;
}

const initialState: FormState = {
  data: {
    accountHolder: null,
    bankName: null,
    accountNumber: null,
    accountType: null,
    identificationNumber: null
  },
  isSubmitting: false
};

export function BankTransferForm({ session }: BankTransferFormProps) {
  const [formState, setFormState] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { id } = e.target;
    if (isValidBankFormField(id)) {
      setFormState(prev => ({
        ...prev,
        data: { ...prev.data, [id]: e.target.value }
      }));
      
      if (errors[id]) {
        setErrors(prev => {
          const { [id]: _, ...rest } = prev;
          return rest;
        });
      }
    }
  }, [errors]);

  const handleSelectChange = useCallback((value: string) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, accountType: value as AccountType }
    }));
    
    if (errors.accountType) {
      setErrors(prev => {
        const { accountType: _, ...rest } = prev;
        return rest;
      });
    }
  }, [errors]);

  const validateForm = useCallback((): ValidationResult => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(formState.data).forEach((key) => {
      if (isValidBankFormField(key)) {
        const value = formState.data[key];
        if (!value) {
          newErrors[key] = 'Este campo es requerido';
          isValid = false;
        }
      }
    });

    return { isValid, errors: newErrors };
  }, [formState.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid, errors: validationErrors } = validateForm();
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      // Aquí iría la lógica de envío del formulario
      console.log('Formulario válido:', formState.data);
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="accountHolder">Nombre del titular</Label>
        <div>
          <Input
            id="accountHolder"
            value={formState.data.accountHolder || ''}
            onChange={handleInputChange}
            className={errors.accountHolder ? 'border-red-500' : ''}
          />
          {errors.accountHolder && (
            <p className="text-sm text-red-500 mt-1">{errors.accountHolder}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bankName">Nombre del banco</Label>
        <div>
          <Input
            id="bankName"
            value={formState.data.bankName || ''}
            onChange={handleInputChange}
            className={errors.bankName ? 'border-red-500' : ''}
          />
          {errors.bankName && (
            <p className="text-sm text-red-500 mt-1">{errors.bankName}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountNumber">Número de cuenta</Label>
        <div>
          <Input
            id="accountNumber"
            value={formState.data.accountNumber || ''}
            onChange={handleInputChange}
            className={errors.accountNumber ? 'border-red-500' : ''}
          />
          {errors.accountNumber && (
            <p className="text-sm text-red-500 mt-1">{errors.accountNumber}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountType">Tipo de cuenta</Label>
        <Select
          value={formState.data.accountType || undefined}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione tipo de cuenta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SAVINGS">Ahorros</SelectItem>
            <SelectItem value="CHECKING">Corriente</SelectItem>
          </SelectContent>
        </Select>
        {errors.accountType && (
          <p className="text-sm text-red-500 mt-1">{errors.accountType}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="identificationNumber">Número de identificación</Label>
        <div>
          <Input
            id="identificationNumber"
            value={formState.data.identificationNumber || ''}
            onChange={handleInputChange}
            className={errors.identificationNumber ? 'border-red-500' : ''}
          />
          {errors.identificationNumber && (
            <p className="text-sm text-red-500 mt-1">{errors.identificationNumber}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={formState.isSubmitting}
      >
        {formState.isSubmitting ? 'Procesando...' : 'Enviar transferencia'}
      </Button>
    </form>
  );
}
