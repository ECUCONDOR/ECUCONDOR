import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';
import { componentLoggers } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

const { api: logger } = componentLoggers;

export async function POST(req: NextRequest) {
  const requestStart = Date.now();
  const requestId = uuidv4();

  try {
    logger.info('Starting upload request', {
      requestId,
      timestamp: new Date().toISOString()
    });

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    logger.info('Supabase client initialized', { requestId });

    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      logger.error('Session error:', authError, { requestId });
      return NextResponse.json({ 
        error: 'No autorizado',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    logger.info('User authenticated', { 
      requestId,
      userId: session.user.id 
    });

    // Get form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      logger.warn('No file provided', { requestId });
      return NextResponse.json({ 
        error: 'No se recibió ningún archivo'
      }, { status: 400 });
    }

    logger.info('File received', { 
      requestId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      logger.warn('File too large', { 
        requestId,
        fileSize: file.size 
      });
      return NextResponse.json({ 
        error: 'El archivo es demasiado grande (máximo 5MB)'
      }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      logger.warn('Invalid file type', { 
        requestId,
        fileType: file.type 
      });
      return NextResponse.json({ 
        error: 'Tipo de archivo no válido'
      }, { status: 400 });
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const uniqueFilename = `${session.user.id}/${uuidv4()}.${fileExt}`;

    logger.info('Attempting file upload', { 
      requestId,
      fileName: uniqueFilename 
    });

    try {
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('comprobantes')
        .upload(uniqueFilename, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (uploadError) {
        logger.error('Upload error:', uploadError, { 
          requestId,
          errorMessage: uploadError.message,
          errorName: uploadError.name,
          details: uploadError 
        });
        return NextResponse.json({ 
          error: `Error durante la subida del archivo: ${uploadError.message}`,
          details: uploadError.message
        }, { status: 500 });
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('comprobantes')
        .getPublicUrl(uniqueFilename);

      const duration = Date.now() - requestStart;
      logger.info('Upload successful', {
        requestId,
        duration,
        fileName: uniqueFilename,
        publicUrl
      });

      return NextResponse.json({ 
        fileUrl: publicUrl,
        message: 'Archivo subido correctamente'
      });

    } catch (uploadError) {
      logger.error('Unexpected upload error:', uploadError, { 
        requestId,
        error: uploadError instanceof Error ? uploadError.message : 'Unknown error'
      });
      return NextResponse.json({ 
        error: `Error al procesar el archivo: ${uploadError instanceof Error ? uploadError.message : 'Error desconocido'}`,
        details: uploadError instanceof Error ? uploadError.message : 'Error desconocido'
      }, { status: 500 });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    logger.error('Unexpected error:', error, {
      requestId,
      errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ 
      error: `Error al procesar el archivo: ${errorMessage}`,
      details: errorMessage
    }, { status: 500 });
  }
}
