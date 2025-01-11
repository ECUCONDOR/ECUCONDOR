import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('POST /api/verify-documents - Iniciando solicitud');

  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Error de autenticación:', authError);
      return NextResponse.json(
        { error: 'Error de autenticación', details: authError.message },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado - Sesión no encontrada' },
        { status: 401 }
      );
    }

    const formData = await request.json();
    console.log('Datos recibidos:', formData);

    // Aquí puedes agregar la lógica para verificar los documentos
    // Por ahora, solo devolvemos un mensaje de éxito
    return NextResponse.json({
      message: 'Documentos verificados exitosamente',
      data: formData
    });

  } catch (error) {
    console.error('Error inesperado:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
