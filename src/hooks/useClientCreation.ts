import { useState } from 'react';
import { clientService } from '@/services/client-service';
import { toast } from 'sonner';
import { ClientData } from '@/services/client-service';

export const useClientCreation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createClient = async (clientData: ClientData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await clientService.createClient(clientData);
      
      toast.success('Cliente creado exitosamente', {
        description: `Se ha registrado el cliente ${clientData.name}`
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Error desconocido al crear el cliente';
      
      setError(errorMessage);
      
      toast.error('Error al crear cliente', {
        description: errorMessage
      });

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createClient,
    isLoading,
    error
  };
};
