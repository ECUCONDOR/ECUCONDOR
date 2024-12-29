'use client';

import DashboardLayout from '@/components/DashboardLayout';
import FormularioRegistroBancario from '@/components/FormularioRegistroBancario';
import React from 'react';

export default function RegistroBancarioPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Registro Bancario</h1>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <FormularioRegistroBancario />
        </div>
      </div>
    </DashboardLayout>
  );
}
