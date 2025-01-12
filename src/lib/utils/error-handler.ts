import { AuthError } from '@supabase/supabase-js';

export interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
}

export class AppError extends Error {
  code: string;
  details?: any;

  constructor(code: string, message: string, details?: any) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'AppError';
  }
}

export const errorCodes = {
  AUTH: {
    SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
    INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
    UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
    NETWORK_ERROR: 'AUTH_NETWORK_ERROR',
    UNKNOWN: 'AUTH_UNKNOWN_ERROR'
  },
  DATABASE: {
    CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
    QUERY_ERROR: 'DB_QUERY_ERROR',
    UNKNOWN: 'DB_UNKNOWN_ERROR'
  }
};

export const handleAuthError = (error: any): ErrorResponse => {
  console.error('Auth error:', error);

  if (error instanceof AuthError) {
    switch (error.status) {
      case 400:
        return {
          code: errorCodes.AUTH.INVALID_CREDENTIALS,
          message: 'Credenciales inválidas'
        };
      case 401:
        return {
          code: errorCodes.AUTH.UNAUTHORIZED,
          message: 'No autorizado'
        };
      default:
        return {
          code: errorCodes.AUTH.UNKNOWN,
          message: 'Error de autenticación desconocido',
          details: error
        };
    }
  }

  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details
    };
  }

  if (error instanceof Error) {
    if (error.message.includes('network')) {
      return {
        code: errorCodes.AUTH.NETWORK_ERROR,
        message: 'Error de conexión',
        details: error
      };
    }
  }

  return {
    code: errorCodes.AUTH.UNKNOWN,
    message: 'Error desconocido',
    details: error
  };
};

export const logError = (
  context: string,
  error: any,
  additionalInfo?: Record<string, any>
) => {
  const timestamp = new Date().toISOString();
  const errorDetails = {
    timestamp,
    context,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    },
    additionalInfo
  };

  console.error('Error logged:', errorDetails);
  
  // Aquí podrías enviar el error a un servicio de monitoreo
  // como Sentry, LogRocket, etc.
};

export const handleDatabaseError = (error: any): ErrorResponse => {
  console.error('Database error:', error);

  if (error.code === 'PGRST301') {
    return {
      code: errorCodes.DATABASE.CONNECTION_ERROR,
      message: 'Error de conexión con la base de datos',
      details: error
    };
  }

  if (error.code?.startsWith('PG')) {
    return {
      code: errorCodes.DATABASE.QUERY_ERROR,
      message: 'Error en la consulta a la base de datos',
      details: error
    };
  }

  return {
    code: errorCodes.DATABASE.UNKNOWN,
    message: 'Error desconocido en la base de datos',
    details: error
  };
};
