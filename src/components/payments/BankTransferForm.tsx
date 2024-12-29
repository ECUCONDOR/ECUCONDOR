'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
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

export function BankTransferForm() {
  const { data: session } = useSession();
  const [formState, setFormState] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<ValidationErrors>({});

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

  const handleChange = useCallback((field: keyof BankFormFields, value: string | null) => {
    setFormState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value
      }
    }));
    
    // Limpiar error del campo cuando cambia
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="accountHolder">Nombre del titular</Label>
          <Input
            id="accountHolder"
            value={formState.data.accountHolder || ''}
            onChange={(e) => handleChange('accountHolder', e.target.value)}
            error={errors.accountHolder}
          />
        </div>

        <div>
          <Label htmlFor="bankName">Nombre del banco</Label>
          <Input
            id="bankName"
            value={formState.data.bankName || ''}
            onChange={(e) => handleChange('bankName', e.target.value)}
            error={errors.bankName}
          />
        </div>

        <div>
          <Label htmlFor="accountNumber">Número de cuenta</Label>
          <Input
            id="accountNumber"
            value={formState.data.accountNumber || ''}
            onChange={(e) => handleChange('accountNumber', e.target.value)}
            error={errors.accountNumber}
          />
        </div>

        <div>
          <Label htmlFor="accountType">Tipo de cuenta</Label>
          <Select
            value={formState.data.accountType || ''}
            onChange={(e) => handleChange('accountType', e.target.value as AccountType)}
          >
            <SelectTrigger>
              <SelectValue defaultValue="Seleccione tipo de cuenta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SAVINGS">Ahorros</SelectItem>
              <SelectItem value="CHECKING">Corriente</SelectItem>
            </SelectContent>
          </Select>
          {errors.accountType && (
            <span className="text-sm text-red-500">{errors.accountType}</span>
          )}
        </div>

        <div>
          <Label htmlFor="identificationNumber">Número de identificación</Label>
          <Input
            id="identificationNumber"
            value={formState.data.identificationNumber || ''}
            onChange={(e) => handleChange('identificationNumber', e.target.value)}
            error={errors.identificationNumber}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={formState.isSubmitting}
      >
        {formState.isSubmitting ? 'Registrando...' : 'Registrar cuenta bancaria'}
      </Button>
    </form>
  );
}
