export class P2PServiceError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly originalError?: any
  ) {
    super(message);
    this.name = 'P2PServiceError';
  }
}

export const P2PErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
  INVALID_STATUS: 'INVALID_STATUS',
} as const;

export function handleServiceError(error: any): never {
  if (error instanceof P2PServiceError) {
    throw error;
  }

  let code = P2PErrorCodes.DATABASE_ERROR;
  let message = 'Error en el servicio P2P';

  if (error?.message?.includes('No autorizado')) {
    code = P2PErrorCodes.UNAUTHORIZED;
    message = 'No estás autorizado para realizar esta acción';
  }
  
  throw new P2PServiceError(message, code, error);
}
