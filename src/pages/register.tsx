import React from 'react';
import Head from 'next/head';
import ProgressiveRegistration from '@/features/authentication/components/ProgressiveRegistration';

export default function RegisterPage() {
  return (
    <>
      <Head>
        <title>Register - ECUCONDOR</title>
        <meta name="description" content="Create your ECUCONDOR account" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Create Your Account
            </h1>
            <p className="text-lg text-gray-600">
              Join ECUCONDOR and start managing your projects today
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <ProgressiveRegistration />
          </div>
        </div>
      </div>
    </>
  );
}
