import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { createBrowserSupabaseClient } from './supabase';

const SUPABASE_S3_URL = 'https://adhivizuhfdxthpgqlxw.supabase.co/storage/v1/s3';
const SUPABASE_REGION = 'sa-east-1';
const SUPABASE_S3_KEY = 'ae1dda9a888c9eb9a9f8bcbdde58b032';

export const s3Client = new S3Client({
  region: SUPABASE_REGION,
  endpoint: SUPABASE_S3_URL,
  credentials: {
    accessKeyId: SUPABASE_S3_KEY,
    secretAccessKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  forcePathStyle: true,
});

export const uploadFileToStorage = async (
  file: File,
  userId: string,
  bucketName: string = 'comprobantes'
): Promise<string> => {
  try {
    // Crear nombre único para el archivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`;

    // Configurar el upload
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: fileName,
        Body: file,
        ContentType: file.type,
      },
    });

    // Realizar la subida
    await upload.done();

    // Obtener la URL pública usando el cliente de Supabase
    const supabase = createBrowserSupabaseClient();
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Error al subir el archivo');
  }
};

export const validateFile = (file: File): void => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Tipo de archivo no permitido. Por favor, suba una imagen (JPG, PNG, GIF) o PDF.');
  }

  if (file.size > maxSize) {
    throw new Error('El archivo no debe superar los 5MB.');
  }
};
