// Definición de tipos de cuenta permitidos
export const ACCOUNT_TYPES = {
  SAVINGS: 'SAVINGS',
  CHECKING: 'CHECKING'
} as const;

// Tipo para los tipos de cuenta
export type AccountType = typeof ACCOUNT_TYPES[keyof typeof ACCOUNT_TYPES];

// Campos base del formulario con tipos estrictos
export interface BankFormFields {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  accountType: AccountType;
  identificationNumber: string;
}

// Tipo para el estado del formulario con campos nulables
export type BankFormState = {
  [K in keyof BankFormFields]: string | null | AccountType;
};

// Tipo para las reglas de validación
interface ValidationRule {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  messages: {
    required: string;
    minLength?: string;
    maxLength?: string;
    pattern?: string;
  };
}

// Tipo para los errores de validación
export type ValidationErrors = {
  [K in keyof BankFormFields]?: string;
};

// Estado inicial del formulario
export const initialBankFormState: BankFormState = {
  accountHolder: null,
  bankName: null,
  accountNumber: null,
  accountType: null,
  identificationNumber: null
};

// Configuración del formulario
export const FORM_CONFIG = {
  TIMEOUT_MS: 5000,
  MIN_ACCOUNT_LENGTH: 10,
  MAX_ACCOUNT_LENGTH: 20,
  MIN_HOLDER_NAME_LENGTH: 3,
  MAX_HOLDER_NAME_LENGTH: 100,
  ID_MIN_LENGTH: 10,
  ID_MAX_LENGTH: 13,
} as const;

// Reglas de validación para cada campo
export const VALIDATION_RULES: Record<keyof BankFormFields, ValidationRule> = {
  accountHolder: {
    required: true,
    minLength: FORM_CONFIG.MIN_HOLDER_NAME_LENGTH,
    maxLength: FORM_CONFIG.MAX_HOLDER_NAME_LENGTH,
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
    messages: {
      required: 'El nombre del titular es requerido',
      minLength: `El nombre debe tener al menos ${FORM_CONFIG.MIN_HOLDER_NAME_LENGTH} caracteres`,
      maxLength: `El nombre no puede exceder ${FORM_CONFIG.MAX_HOLDER_NAME_LENGTH} caracteres`,
      pattern: 'El nombre solo puede contener letras y espacios'
    }
  },
  bankName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
    messages: {
      required: 'El nombre del banco es requerido',
      minLength: 'El nombre del banco debe tener al menos 2 caracteres',
      maxLength: 'El nombre del banco no puede exceder 100 caracteres',
      pattern: 'El nombre del banco solo puede contener letras y espacios'
    }
  },
  accountNumber: {
    required: true,
    minLength: FORM_CONFIG.MIN_ACCOUNT_LENGTH,
    maxLength: FORM_CONFIG.MAX_ACCOUNT_LENGTH,
    pattern: /^\d+$/,
    messages: {
      required: 'El número de cuenta es requerido',
      minLength: `El número de cuenta debe tener al menos ${FORM_CONFIG.MIN_ACCOUNT_LENGTH} dígitos`,
      maxLength: `El número de cuenta no puede exceder ${FORM_CONFIG.MAX_ACCOUNT_LENGTH} dígitos`,
      pattern: 'El número de cuenta solo puede contener números'
    }
  },
  accountType: {
    required: true,
    messages: {
      required: 'El tipo de cuenta es requerido'
    }
  },
  identificationNumber: {
    required: true,
    minLength: FORM_CONFIG.ID_MIN_LENGTH,
    maxLength: FORM_CONFIG.ID_MAX_LENGTH,
    pattern: /^\d+$/,
    messages: {
      required: 'El número de identificación es requerido',
      minLength: `El número de identificación debe tener al menos ${FORM_CONFIG.ID_MIN_LENGTH} dígitos`,
      maxLength: `El número de identificación no puede exceder ${FORM_CONFIG.ID_MAX_LENGTH} dígitos`,
      pattern: 'El número de identificación solo puede contener números'
    }
  }
} as const;

// Type guard para verificar campos válidos
export const isFormField = (key: string): key is keyof BankFormFields => {
  return key in VALIDATION_RULES;
};

// Utilidad para verificar si hay errores de validación
export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};

// Función para validar un campo individual
export const validateField = (
  field: keyof BankFormFields,
  value: string | null
): string | undefined => {
  const rules = VALIDATION_RULES[field];

  if (!value) {
    return rules.messages.required;
  }

  if (rules.minLength && value.length < rules.minLength) {
    return rules.messages.minLength;
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return rules.messages.maxLength;
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return rules.messages.pattern;
  }

  return undefined;
};

// Utilidad para convertir datos del formulario a formato de envío
export const toSubmitFormat = (formData: BankFormState): BankFormFields | null => {
  const requiredFields = Object.keys(VALIDATION_RULES) as Array<keyof BankFormFields>;
  
  // Verificar que todos los campos requeridos tengan valor
  const missingFields = requiredFields.filter(field => !formData[field]);
  if (missingFields.length > 0) {
    return null;
  }

  // Convertir a formato final asegurando tipos no nulos
  return {
    accountHolder: formData.accountHolder!,
    bankName: formData.bankName!,
    accountNumber: formData.accountNumber!,
    accountType: formData.accountType as AccountType,
    identificationNumber: formData.identificationNumber!
  };
};
