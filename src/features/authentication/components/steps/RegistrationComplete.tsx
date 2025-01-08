'use client';

import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type VerificationStatus = 'pending' | 'approved' | 'rejected';

interface StatusContent {
  title: string;
  message: string;
  icon: JSX.Element;
}

export default function RegistrationComplete({ status = 'pending' }: { status: VerificationStatus }) {
  const getStatusContent = (status: VerificationStatus): StatusContent => {
    switch (status) {
      case 'pending':
        return {
          title: 'Verification in Progress',
          message: 'Your documents are being reviewed. We will notify you once the verification is complete.',
          icon: (
            <svg
              className="h-12 w-12 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        };
      case 'approved':
        return {
          title: 'Verification Approved',
          message: 'Your account has been verified successfully. You can now access all features.',
          icon: <CheckCircle2 className="h-12 w-12 text-green-500" />,
        };
      case 'rejected':
        return {
          title: 'Verification Failed',
          message: 'We could not verify your documents. Please contact support for assistance.',
          icon: <XCircle className="h-12 w-12 text-red-500" />,
        };
      default:
        return {
          title: 'Unknown Status',
          message: 'Please contact support for assistance.',
          icon: <AlertTriangle className="h-12 w-12 text-yellow-500" />,
        };
    }
  };

  const content = getStatusContent(status);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-black p-4">
      <div className="max-w-md w-full space-y-8 bg-white/5 backdrop-blur-lg p-8 rounded-xl border border-white/10">
        <div className="flex flex-col items-center space-y-4">
          {content.icon}
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            {content.title}
          </h2>
          <p className="text-center text-gray-300">
            {content.message}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {status === 'approved' && (
            <Link href="/dashboard" className="w-full">
              <Button className="w-full" variant="default">
                Go to Dashboard
              </Button>
            </Link>
          )}
          {status === 'rejected' && (
            <Link href="/support" className="w-full">
              <Button className="w-full" variant="destructive">
                Contact Support
              </Button>
            </Link>
          )}
          <Link href="/auth/login" className="w-full">
            <Button className="w-full" variant="outline">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
