export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown): never {
  console.error('Error:', error);
  
  if (error instanceof AppError) {
    throw error;
  }
  
  throw new AppError(
    'Error interno del servidor',
    'INTERNAL_SERVER_ERROR',
    500
  );
}
