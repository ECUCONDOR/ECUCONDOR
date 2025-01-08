'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientService } from '@/services/clients';
import { Client } from '@/types/database';
import { ClientResponse } from '@/types/onboarding';

const testClient = {
  first_name: "Eduardo",
  last_name: "Marques",
  name: "Eduardo Marques",
  type: "personal" as const,
  identification: "95466020",
  email: "ecucondor@example.com",
  phone: "1124099147",
  address: "Sarandi328"
};

const minimalClient = {
  first_name: "Ana",
  last_name: "López",
  name: "Ana López",
  type: "personal" as const,
  identification: "0987654321",
  email: "ana@example.com",
  phone: "1234567890",
  address: ""
};

export default function TestPage() {
  const [results, setResults] = useState<{
    success: boolean;
    message: string;
    data?: any;
  }[]>([]);
  const [clients, setClients] = useState<ClientResponse[]>([]);

  const addResult = (success: boolean, message: string, data?: any) => {
    setResults(prev => [...prev, { success, message, data }]);
  };

  const runTests = async () => {
    setResults([]);
    const clientService = new ClientService();

    // Test 1: Crear cliente con todos los campos
    try {
      const fullClient = await clientService.createClient(testClient);
      addResult(true, "✅ Cliente creado con todos los campos", fullClient);
    } catch (error) {
      addResult(false, `❌ Error al crear cliente completo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }

    // Test 2: Crear cliente con campos mínimos
    try {
      const minimal = await clientService.createClient(minimalClient);
      addResult(true, "✅ Cliente creado con campos mínimos", minimal);
    } catch (error) {
      addResult(false, `❌ Error al crear cliente mínimo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }

    // Test 3: Verificar RLS - Obtener clientes
    try {
      const userClients = await clientService.getUserClients();
      setClients(userClients);
      addResult(true, `✅ Clientes obtenidos: ${userClients.length} registros`);
    } catch (error) {
      addResult(false, `❌ Error al obtener clientes: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Pruebas de Implementación de Clientes</h1>
      
      <Button onClick={runTests}>Ejecutar Pruebas</Button>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Resultados:</h2>
        {results.map((result, index) => (
          <Card key={index} className={result.success ? "border-green-500" : "border-red-500"}>
            <CardHeader>
              <CardTitle className={result.success ? "text-green-700" : "text-red-700"}>
                {result.message}
              </CardTitle>
            </CardHeader>
            {result.data && (
              <CardContent>
                <pre className="bg-gray-100 p-2 rounded">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {clients.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Clientes en Base de Datos:</h2>
          {clients.map((client) => (
            <Card key={client.id}>
              <CardContent className="p-4">
                <h3 className="font-bold">
                  {client.name}
                </h3>
                <p className="text-sm text-gray-500">{client.identification}</p>
                <p className="text-sm">{client.email}</p>
                {client.phone && (
                  <p className="text-sm">{client.phone}</p>
                )}
                {client.address && (
                  <p className="text-sm text-gray-600">{client.address}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Creado: {new Date(client.created_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
