'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import GeneralSettings from '@/components/settings/GeneralSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import PrivacySettings from '@/components/settings/PrivacySettings';
import PreferenceSettings from '@/components/settings/PreferenceSettings';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Configuraciones</h1>
        
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
            <TabsTrigger value="privacy">Privacidad</TabsTrigger>
            <TabsTrigger value="preferences">Preferencias</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="p-6">
              <GeneralSettings />
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="p-6">
              <NotificationSettings />
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card className="p-6">
              <PrivacySettings />
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card className="p-6">
              <PreferenceSettings />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
