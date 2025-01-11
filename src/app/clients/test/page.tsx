'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientService } from '@/services/clients';
import { ClientResponse } from '@/types/onboarding';

const testClient = {
  first_name: "Eduardo",
  last_name: "Marques",
  identification: "95466020",
  email: "ecucondor@example.com",
  phone: "1124099147",
  type: "personal" as const,
  created_by: 'user-id-here' // Required field
};

const minimalClient = {
  first_name: "Ana",
  last_name: "López",
  identification: "0987654321",
  email: "ana@example.com",
  type: "personal" as const,
  created_by: 'user-id-here' // Required field
};

export default function TestPage() {
  const [results, setResults] = useState(null as {
    success: boolean;
    message: string;
    data?: any;
  } | null);
  const [clients, setClients] = useState([] as ClientResponse[]);

  const addResult = (success: boolean, message: string, data?: any) => {
    setResults({
      success,
      message,
      data
    });
  };

  const runTests = async () => {
    setResults(null);
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
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Pruebas de Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runTests}>Ejecutar Pruebas</Button>

          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Resultados:</h3>
            {results && (
              <div
                className={`p-2 mb-2 rounded ${
                  results.success ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <p className="font-medium">
                  {results.success ? "✅ Éxito:" : "❌ Error:"}
                </p>
                <p>{results.message}</p>
                {results.data && (
                  <pre className="mt-2 p-2 bg-gray-100 rounded">
                    {JSON.stringify(results.data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>

          {clients.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Clientes:</h3>
              {clients.map((client: ClientResponse) => (
                <div key={client.id} className="p-2 mb-2 border rounded">
                  <p>
                    {client.first_name} {client.last_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    ID: {client.identification}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
