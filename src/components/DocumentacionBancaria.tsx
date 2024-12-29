import React, { useState } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';

interface DocumentacionBancariaProps {
  onDocumentUpload: (tipo: string, file: File) => Promise<void>;
}

interface Documento {
  file: File | null;
  status: string;
  error: string;
}

interface Documentos {
  [key: string]: Documento;
}

const DocumentacionBancaria = ({ onDocumentUpload }: DocumentacionBancariaProps) => {
  const [documentos, setDocumentos] = useState<Documentos>({
    identidad: { file: null, status: 'pendiente', error: '' },
    ingresos: { file: null, status: 'pendiente', error: '' },
    domicilio: { file: null, status: 'pendiente', error: '' }
  });

  const handleFileChange = async (tipo: string, file: File) => {
    try {
      setDocumentos(prev => ({
        ...prev,
        [tipo]: { ...prev[tipo], status: 'cargando', error: '' }
      }));

      await onDocumentUpload(tipo, file);

      setDocumentos(prev => ({
        ...prev,
        [tipo]: { file, status: 'completado', error: '' }
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar el archivo';
      console.error('Error al procesar la documentación:', errorMessage);
      
      setDocumentos(prev => ({
        ...prev,
        [tipo]: { ...prev[tipo], status: 'error', error: errorMessage }
      }));
    }
  };

  const renderDocumentUploader = (tipo: string, label: string) => {
    const doc = documentos[tipo];
    
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className={`border-2 border-dashed rounded-lg p-6
          ${doc.status === 'cargando' ? 'border-blue-300 bg-blue-50' :
            doc.status === 'completado' ? 'border-green-300 bg-green-50' :
            doc.status === 'error' ? 'border-red-300 bg-red-50' :
            'border-gray-300 hover:border-gray-400'}
        `}>
          <div className="flex flex-col items-center">
            {doc.status === 'pendiente' && (
              <>
                <Upload className="h-10 w-10 text-gray-400 mb-3" />
                <input
                  type="file"
                  className="hidden"
                  id={`file-${tipo}`}
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileChange(tipo, file);
                  }}
                />
                <label
                  htmlFor={`file-${tipo}`}
                  className="cursor-pointer text-sm text-gray-600 hover:text-gray-800"
                >
                  Haz clic para subir o arrastra y suelta
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG o PNG (máx. 5MB)
                </p>
              </>
            )}

            {doc.status === 'cargando' && (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
                <p className="mt-2 text-sm text-blue-600">Subiendo documento...</p>
              </div>
            )}

            {doc.status === 'completado' && (
              <div className="flex flex-col items-center">
                <Check className="h-10 w-10 text-green-500 mb-2" />
                <p className="text-sm text-green-600">
                  {doc.file?.name || 'Documento subido correctamente'}
                </p>
                <button
                  className="mt-2 text-xs text-gray-500 hover:text-red-500"
                  onClick={() => setDocumentos(prev => ({
                    ...prev,
                    [tipo]: { file: null, status: 'pendiente', error: '' }
                  }))}
                >
                  Eliminar
                </button>
              </div>
            )}

            {doc.status === 'error' && (
              <div className="flex flex-col items-center">
                <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                <p className="text-sm text-red-600">{doc.error}</p>
                <button
                  className="mt-2 text-xs text-blue-500 hover:text-blue-700"
                  onClick={() => setDocumentos(prev => ({
                    ...prev,
                    [tipo]: { file: null, status: 'pendiente', error: '' }
                  }))}
                >
                  Intentar nuevamente
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Documentación Requerida</h2>
      
      {renderDocumentUploader('identidad', 'Documento de Identidad')}
      {renderDocumentUploader('ingresos', 'Comprobante de Ingresos')}
      {renderDocumentUploader('domicilio', 'Comprobante de Domicilio')}
    </div>
  );
};

export default DocumentacionBancaria;
