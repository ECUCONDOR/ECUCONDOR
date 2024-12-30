export enum P2PErrorCodes {
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export const P2PServiceErrorCodes = {
  LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const;

export class P2PError extends Error {
  code: P2PErrorCodes;
  details?: any;

  constructor(code: P2PErrorCodes, message: string, details?: any) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'P2PError';
  }
}

export class P2PServiceError extends Error {
  code: string;
  
  constructor(code: keyof typeof P2PServiceErrorCodes, message: string) {
    super(message);
    this.code = P2PServiceErrorCodes[code];
    this.name = 'P2PServiceError';
  }
}

export function handleServiceError(error: any): never {
  if (error instanceof P2PError) {
    throw error;
  }

  let code = P2PErrorCodes.DATABASE_ERROR;
  let message = 'Error en el servicio P2P';

  if (error?.message?.includes('No autorizado')) {
    code = P2PErrorCodes.UNAUTHORIZED;
    message = 'No estás autorizado para realizar esta acción';
  }
  
  throw new P2PError(code, message, error);
}
