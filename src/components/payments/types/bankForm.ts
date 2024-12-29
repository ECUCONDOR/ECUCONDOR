// Tipos de cuenta bancaria permitidos
export type AccountType = 'SAVINGS' | 'CHECKING';

// Campos base del formulario bancario
export interface BankFormFields {
  bankName: string | null;
  accountNumber: string | null;
  accountType: AccountType | null;
  accountHolder: string | null;
  identificationNumber: string | null;
}

// Estado del formulario incluyendo error
export interface BankFormState extends BankFormFields {
  error: string | null;
}

// Errores de validación por campo
export type ValidationErrors = {
  [key in keyof BankFormFields]?: string;
};

// Resultado de la validación
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

// Estado inicial del formulario
export const initialBankFormState: BankFormState = {
  bankName: null,
  accountNumber: null,
  accountType: null,
  accountHolder: null,
  identificationNumber: null,
  error: null
};

// Tipo para verificar campos válidos
export type BankFormField = keyof BankFormFields;

// Función para verificar si una clave es un campo válido del formulario
export const isValidBankFormField = (key: string): key is BankFormField => {
  return key in initialBankFormState;
};

// Reglas de validación
export const bankFormValidations = {
  bankName: {
    required: true,
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
    message: {
      required: 'El nombre del banco es requerido',
      minLength: 'El nombre del banco debe tener al menos 3 caracteres',
      maxLength: 'El nombre del banco no puede exceder 100 caracteres',
      pattern: 'El nombre del banco solo puede contener letras y espacios'
    }
  },
  accountNumber: {
    required: true,
    pattern: /^\d{10,20}$/,
    message: {
      required: 'El número de cuenta es requerido',
      pattern: 'El número de cuenta debe tener entre 10 y 20 dígitos'
    }
  },
  accountType: {
    required: true,
    message: {
      required: 'El tipo de cuenta es requerido'
    }
  },
  accountHolder: {
    required: true,
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
    message: {
      required: 'El nombre del titular es requerido',
      minLength: 'El nombre del titular debe tener al menos 3 caracteres',
      maxLength: 'El nombre del titular no puede exceder 100 caracteres',
      pattern: 'El nombre del titular solo puede contener letras y espacios'
    }
  },
  identificationNumber: {
    required: true,
    pattern: /^\d{10,13}$/,
    message: {
      required: 'El número de identificación es requerido',
      pattern: 'El número de identificación debe tener entre 10 y 13 dígitos'
    }
  }
};
