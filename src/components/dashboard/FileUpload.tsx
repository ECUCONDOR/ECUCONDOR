'use client';

import { useState } from 'react';
import { Upload, X, Check } from 'lucide-react';

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      // Aquí irá la lógica de carga del archivo
      // Por ahora solo simulamos una carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUploadSuccess(true);
    } catch (error) {
      console.error('Error al cargar el archivo:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadSuccess(false);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center space-x-4 mb-4">
        <Upload className="w-6 h-6 text-[#722F37]" />
        <h4 className="font-semibold text-gray-200">Comprobante de Pago</h4>
      </div>

      <div className="space-y-4">
        {!file ? (
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            <label className="cursor-pointer block">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <div className="space-y-2">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="text-gray-300">
                  Haga clic para seleccionar o arrastre un archivo
                </p>
                <p className="text-sm text-gray-500">
                  PDF, JPG o PNG (máx. 10MB)
                </p>
              </div>
            </label>
          </div>
        ) : (
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {uploadSuccess ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Upload className="h-5 w-5 text-[#722F37]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!uploadSuccess && (
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className={`px-3 py-1 text-sm font-medium rounded-md ${
                      uploading
                        ? 'bg-gray-600 text-gray-300'
                        : 'bg-[#722F37] text-white hover:bg-[#722F37]/90'
                    }`}
                  >
                    {uploading ? 'Subiendo...' : 'Subir'}
                  </button>
                )}
                <button
                  onClick={handleRemoveFile}
                  className="p-1 text-gray-400 hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {uploadSuccess && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-500" />
              <p className="text-sm text-green-500">
                Archivo subido exitosamente
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
