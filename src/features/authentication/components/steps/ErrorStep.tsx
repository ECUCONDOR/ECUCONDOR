import React from 'react';

interface ErrorStepProps {
  error?: string;
  onRetry: () => void;
}

export default function ErrorStep({ error, onRetry }: ErrorStepProps) {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <svg
          className="h-12 w-12 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-red-600">Error</h2>
        <p className="text-gray-600 mt-2">
          {error || 'An unexpected error occurred. Please try again.'}
        </p>
      </div>
      <div className="pt-4">
        <button
          onClick={onRetry}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
