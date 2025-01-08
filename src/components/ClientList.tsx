'use client';

import { useEffect, useState } from 'react';
import { Client } from '@/types/database';
import { ClientService } from '@/services/clients';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const clientService = new ClientService();
      const data = await clientService.getUserClients();
      setClients(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar los clientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {clients.map((client) => (
        <Card key={client.id}>
          <CardContent className="p-4">
            <h3 className="font-bold">
              {client.first_name} {client.last_name}
            </h3>
            <p className="text-sm text-gray-500">{client.identification}</p>
            <p className="text-sm">{client.email}</p>
            {client.phone && (
              <p className="text-sm">{client.phone}</p>
            )}
            {client.address && (
              <p className="text-sm text-gray-600">{client.address}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
