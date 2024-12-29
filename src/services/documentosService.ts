import { supabase } from '@/lib/supabase';
import { DocumentoBancarioType, DocumentoResultado } from '@/types/registroBancario.types';

export const subirDocumento = async (
  file: File,
  registroId: string,
  tipoDocumento: 'identidad' | 'ingresos' | 'domicilio'
): Promise<DocumentoResultado> => {
  try {
    // Validar el archivo
    if (file.size > 5 * 1024 * 1024) { // 5MB máximo
      throw new Error('El archivo no debe superar 5MB');
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Solo se permiten archivos PDF, JPG o PNG');
    }

    // Generar nombre único
    const fileExt = file.name.split('.').pop();
    const fileName = `${registroId}/${tipoDocumento}_${Date.now()}.${fileExt}`;

    // Subir a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documentos-bancarios')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Generar URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('documentos-bancarios')
      .getPublicUrl(fileName);

    // Registrar en la base de datos
    const { data, error } = await supabase
      .from('documentos_bancarios')
      .insert({
        registro_id: registroId,
        tipo_documento: tipoDocumento,
        url_documento: publicUrl,
        hash_documento: await generarHashArchivo(file)
      })
      .single();

    if (error) throw error;
    return data;

  } catch (error) {
    console.error('Error al subir documento:', error);
    throw error;
  }
};

// Función auxiliar para generar hash
async function generarHashArchivo(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
