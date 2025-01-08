import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/lib/supabase';

interface DocumentVerificationStepProps {
  userId: string;
  clientId?: string;
  onBack: () => void;
}

export default function DocumentVerificationStep({
  userId,
  clientId,
  onBack,
}: DocumentVerificationStepProps) {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsUploading(true);
      setError(null);

      try {
        const uploadPromises = acceptedFiles.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${userId}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('verification-documents')
            .upload(filePath, file);

          if (uploadError) {
            throw uploadError;
          }

          return filePath;
        });

        const newFiles = await Promise.all(uploadPromises);
        setUploadedFiles((prev) => [...prev, ...newFiles]);
      } catch (err) {
        console.error('Error uploading files:', err);
        setError('Failed to upload files. Please try again.');
      } finally {
        setIsUploading(false);
      }
    },
    [userId]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxSize: 5000000, // 5MB
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Document Verification</h2>
        <p className="text-gray-600">
          Please upload the required documents for verification
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-indigo-400'
          }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 14v20c0 4.418 3.582 8 8 8h16c4.418 0 8-3.582 8-8V14m-4 0l-8-8-8 8m8-8v28"
            />
          </svg>
          <div className="text-sm text-gray-600">
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>
                Drag 'n' drop some files here, or click to select files
                <br />
                <span className="text-xs">
                  (PDF, PNG, JPG up to 5MB)
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Uploaded Files:</h3>
          <ul className="space-y-1">
            {uploadedFiles.map((file, index) => (
              <li
                key={index}
                className="text-sm text-gray-600 flex items-center space-x-2"
              >
                <svg
                  className="h-4 w-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{file.split('/').pop()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          disabled={isUploading || uploadedFiles.length === 0}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Submit for Verification'}
        </button>
      </div>
    </div>
  );
}
