import { useState } from 'react';
import { Upload, X, Check, Loader2 } from 'lucide-react';
import { subirDocumento } from '@/services/documentosService';

interface DocumentUploaderProps {
  label: string;
  tipoDocumento: 'identidad' | 'ingresos' | 'domicilio';
  registroId: string;
  onUploadComplete: (url: string) => void;
  onError: (error: string) => void;
}

export const DocumentUploader = ({
  label,
  tipoDocumento,
  registroId,
  onUploadComplete,
  onError
}: DocumentUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setFile(selectedFile);

      const result = await subirDocumento(selectedFile, registroId, tipoDocumento);
      
      // Aseguramos que result es del tipo correcto
      if (result && 'url_documento' in result) {
        setUploadSuccess(true);
        onUploadComplete(result.url_documento);
        setSuccess(true);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }

    } catch (err) {
      setUploadSuccess(false);
      // Verificar si err es una instancia de Error
      if (err instanceof Error) {
        onError(err.message);
        setError(err.message);
      } else {
        onError('Ocurrió un error desconocido');
        setError('Ocurrió un error desconocido');
      }
      
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-2 text-gray-700">
        {label}
      </label>
      
      <div className={`
        border-2 border-dashed rounded-lg p-4
        ${isUploading ? 'border-blue-300 bg-blue-50' :
          uploadSuccess ? 'border-green-300 bg-green-50' :
          'border-gray-300 hover:border-gray-400'}
      `}>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="hidden"
          id={`file-${tipoDocumento}`}
          disabled={isUploading}
        />
        
        <label
          htmlFor={`file-${tipoDocumento}`}
          className="flex flex-col items-center cursor-pointer"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <span className="mt-2 text-sm text-blue-600">
                Subiendo documento...
              </span>
            </>
          ) : uploadSuccess ? (
            <>
              <Check className="h-8 w-8 text-green-500" />
              <span className="mt-2 text-sm text-green-600">
                {file?.name || 'Documento subido correctamente'}
              </span>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-400" />
              <span className="mt-2 text-sm text-gray-500">
                Haz clic para subir o arrastra y suelta
              </span>
              <span className="text-xs text-gray-400 mt-1">
                PDF, JPG o PNG (máx. 5MB)
              </span>
            </>
          )}
        </label>
      </div>

      {/* Diálogo de Confirmación */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h3 className="text-xl font-bold mb-4" style={{ color: 'primary' }}>
              Confirmar Envío
            </h3>
            <p className="mb-4">
              ¿Está seguro que desea enviar esta solicitud? Por favor verifique que todos los datos sean correctos.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: 'surface',
                  color: 'primary',
                  border: `1px solid primary`
                }}
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  setShowConfirmDialog(false);
                  await handleFileChange;
                }}
                className="px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: 'primary',
                  color: 'surface'
                }}
                disabled={isUploading}
              >
                {isUploading ? 'Enviando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de Error */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 p-4 rounded shadow-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Mensaje de Éxito */}
      {success && (
        <div className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 p-4 rounded shadow-lg">
          <p className="text-green-700">
            Su solicitud ha sido enviada exitosamente. Le contactaremos pronto.
          </p>
        </div>
      )}

      {/* Botón modificado */}
      <button
        onClick={() => setShowConfirmDialog(true)}
        disabled={!file || isUploading}
        className="px-6 py-2 rounded-lg flex items-center"
        style={{
          backgroundColor: 'primary',
          color: 'surface',
          opacity: file && !isUploading ? 1 : 0.5
        }}
      >
        {isUploading ? (
          <>
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Enviando...
          </>
        ) : (
          'Enviar Solicitud'
        )}
      </button>
    </div>
  );
};
