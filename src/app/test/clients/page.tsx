'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClientService } from '@/services/clients';
import { Client } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';

export default function TestPage() {
  const [results, setResults] = useState<string[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const { user, loading, signIn, signOut } = useAuth();

  const addResult = (message: string) => {
    setResults(prev => [...prev, message]);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(credentials.email, credentials.password);
      addResult('✅ Usuario autenticado correctamente');
    } catch (error) {
      addResult(`❌ Error al autenticar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      addResult('✅ Sesión cerrada correctamente');
      setClients([]);
    } catch (error) {
      addResult(`❌ Error al cerrar sesión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const runTests = async () => {
    if (!user) {
      addResult('❌ Usuario no autenticado. Por favor, inicie sesión primero.');
      return;
    }

    setResults([]);
    const clientService = new ClientService();

    // Test 1: Cliente completo
    try {
      const fullClient = await clientService.createClient({
        first_name: "Eduardo",
        last_name: "Marques",
        identification: "95466020",
        email: "ecucondor@example.com",
        phone: "1124099147",
        address: "Sarandi328"
      });
      addResult('✅ Cliente completo creado exitosamente');
      console.log('Cliente completo:', fullClient);
    } catch (error) {
      addResult(`❌ Error al crear cliente completo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }

    // Test 2: Cliente mínimo
    try {
      const minimalClient = await clientService.createClient({
        first_name: "Ana",
        last_name: "López",
        identification: "0987654321",
        email: "ana@example.com"
      });
      addResult('✅ Cliente mínimo creado exitosamente');
      console.log('Cliente mínimo:', minimalClient);
    } catch (error) {
      addResult(`❌ Error al crear cliente mínimo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }

    // Test 3: Verificar lista de clientes
    try {
      const allClients = await clientService.getUserClients();
      setClients(allClients);
      addResult(`✅ Se encontraron ${allClients.length} clientes`);
    } catch (error) {
      addResult(`❌ Error al obtener clientes: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pruebas de Clientes</h1>
      
      {!user ? (
        <form onSubmit={handleSignIn} className="space-y-4 max-w-md mb-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Contraseña"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>
          <Button type="submit">Iniciar Sesión</Button>
        </form>
      ) : (
        <div className="space-y-4 mb-4">
          <p className="text-sm text-gray-600">
            Autenticado como: {user.email}
          </p>
          <div className="space-x-4">
            <Button onClick={runTests}>Ejecutar Pruebas</Button>
            <Button onClick={handleSignOut} variant="outline">Cerrar Sesión</Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Resultados:</h2>
          {results.map((result, index) => (
            <div key={index} className="mb-1">{result}</div>
          ))}
        </div>

        {clients.length > 0 && (
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-bold mb-2">Clientes en la base de datos:</h2>
            {clients.map((client) => (
              <div key={client.id} className="mb-2 p-2 bg-white rounded">
                <p><strong>{client.first_name} {client.last_name}</strong></p>
                <p>ID: {client.identification}</p>
                <p>Email: {client.email}</p>
                {client.phone && <p>Teléfono: {client.phone}</p>}
                {client.address && <p>Dirección: {client.address}</p>}
                <p className="text-sm text-gray-500">
                  Creado: {new Date(client.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
