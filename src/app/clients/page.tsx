import { ClientForm } from '@/components/ClientForm';
import { ClientList } from '@/components/ClientList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ClientsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Clientes</h1>
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Lista de Clientes</TabsTrigger>
          <TabsTrigger value="create">Nuevo Cliente</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <ClientList />
        </TabsContent>
        
        <TabsContent value="create">
          <div className="max-w-2xl mx-auto">
            <ClientForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
