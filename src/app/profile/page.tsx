'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import ProfileForm from '@/components/profile/ProfileForm';
import SecuritySettings from '@/components/profile/SecuritySettings';
import VerificationStatus from '@/components/profile/VerificationStatus';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ProfileData {
  id: string;
  full_name?: string;
  [key: string]: any;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const { toast } = useToast();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        // Primero intentamos crear la tabla si no existe
        const { error: createError } = await supabase.rpc('create_profiles_if_not_exists');
        if (createError) {
          console.error('Error creating profiles table:', createError);
        }

        // Luego intentamos obtener los datos del perfil
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id)
          .single();

        if (error) {
          if (error.code === '42P01') { // Tabla no existe
            // Intentar crear el perfil
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([
                { 
                  id: user?.id,
                  full_name: user?.user_metadata?.full_name || '',
                }
              ]);
            if (insertError) throw insertError;
          } else {
            throw error;
          }
        } else {
          setProfileData(data);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar la información del perfil',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadProfileData();
    }
  }, [user, supabase, toast]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Mi Cuenta</h1>
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="security">Seguridad</TabsTrigger>
            <TabsTrigger value="verification">Verificación</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardContent className="pt-6">
                <ProfileForm initialData={profileData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardContent className="pt-6">
                <SecuritySettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification">
            <Card>
              <CardContent className="pt-6">
                <VerificationStatus />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
