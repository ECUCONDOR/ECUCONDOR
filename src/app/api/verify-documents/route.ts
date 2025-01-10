import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

export async function POST(request: Request) {
  console.log('POST /api/verify-documents - Iniciando solicitud');
  
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            console.error('Error al establecer cookie:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete({ name, ...options });
          } catch (error) {
            console.error('Error al eliminar cookie:', error);
          }
        },
      },
    }
  );

  try {
    // 1. Verificar autenticación
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('Error de sesión:', sessionError);
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // 2. Obtener y validar datos
    const { userId, documents, clientId } = await request.json();

    if (!userId || !documents || !Array.isArray(documents)) {
      return NextResponse.json(
        { error: 'Datos de solicitud inválidos' },
        { status: 400 }
      );
    }

    // Verificar que el usuario tenga permisos
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No autorizado para verificar estos documentos' },
        { status: 403 }
      );
    }

    // 3. Verificar que todos los documentos existan en storage
    const { data: files, error: listError } = await supabase.storage
      .from('verification-documents')
      .list(userId);

    if (listError) {
      console.error('Error al listar archivos:', listError);
      return NextResponse.json(
        { error: 'Error al verificar documentos' },
        { status: 500 }
      );
    }

    interface StorageFile {
      name: string;
      id: string;
      created_at: string;
      last_accessed_at: string;
      metadata: any;
      updated_at: string;
    }

    const uploadedFileNames = files.map((file: StorageFile) => `${userId}/${file.name}`);
    const allDocumentsExist = documents.every(doc => 
      uploadedFileNames.includes(doc)
    );

    if (!allDocumentsExist) {
      return NextResponse.json({ 
        error: 'Uno o más documentos no se encuentran',
        status: 'rejected'
      }, { status: 400 });
    }

    // 4. Actualizar estado de verificación
    const { error: verificationError } = await supabase
      .from('verification_status')
      .upsert({
        user_id: userId,
        client_id: clientId,
        status: 'verified',
        updated_at: new Date().toISOString()
      });

    if (verificationError) {
      console.error('Error al actualizar estado de verificación:', verificationError);
      return NextResponse.json(
        { error: 'Error al actualizar estado de verificación' },
        { status: 500 }
      );
    }

    // 5. Actualizar estado del usuario
    const { error: updateError } = await supabase
      .from('users')
      .update({ verification_status: 'verified' })
      .eq('id', userId);

    if (updateError) {
      console.error('Error al actualizar estado del usuario:', updateError);
      return NextResponse.json(
        { error: 'Error al actualizar estado del usuario' },
        { status: 500 }
      );
    }

    console.log('Verificación completada exitosamente');
    return NextResponse.json({ 
      message: 'Documentos verificados exitosamente',
      status: 'verified'
    });

  } catch (error) {
    console.error('Error general en POST /api/verify-documents:', error);
    return NextResponse.json({ 
      error: 'Error al procesar la solicitud',
      details: error instanceof Error ? error.message : 'Error desconocido',
      status: 'rejected'
    }, { status: 500 });
  }
}
