import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';
import type { ClientFormData } from '@/types/onboarding';

interface DatabaseError {
  code: string;
  message: string;
}

type RequiredClientFields = Pick<Required<ClientFormData>, 'identification' | 'email' | 'phone' | 'first_name' | 'last_name'>;

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  
  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Error de autenticación' },
        { status: 401 }
      );
    }

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado - Sesión no encontrada' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    const formData = await request.json() as ClientFormData;
    
    // Validate required fields
    if (!formData.identification?.trim() || 
        !formData.email?.trim() || 
        !formData.phone?.trim() ||
        !formData.first_name?.trim() ||
        !formData.last_name?.trim()) {
      return NextResponse.json(
        { error: 'Campos requeridos faltantes: identificación, email, teléfono, nombre o apellido' },
        { status: 400 }
      );
    }

    const { data: existingClient, error: searchError } = await supabase
      .from('clients')
      .select('*')
      .eq('identification', formData.identification.trim())
      .single();

    if (searchError && searchError.code !== 'PGRST116') {
      throw searchError;
    }

    if (existingClient) {
      try {
        const { data: relations, error: relationCheckError } = await supabase
          .from('user_client_relation')
          .select('*')
          .eq('user_id', userId)
          .eq('client_id', existingClient.id);

        if (relationCheckError) {
          throw relationCheckError;
        }

        if (!relations?.length) {
          const { error: relationError } = await supabase
            .from('user_client_relation')
            .insert([{
              user_id: userId,
              client_id: existingClient.id,
              status: 'ACTIVE'
            }]);

          if (relationError) {
            throw relationError;
          }
        }

        return NextResponse.json({ 
          client: existingClient,
          isExisting: true 
        });

      } catch (error) {
        if (error && typeof error === 'object' && 'code' in error) {
          throw error;
        }
        throw new Error('Error handling client relation');
      }
    }

    const clientData: ClientFormData = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      identification: formData.identification.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      created_by: userId
    };

    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert([clientData])
      .select()
      .single();

    if (clientError) {
      throw clientError;
    }

    try {
      const { error: relationError } = await supabase
        .from('user_client_relation')
        .insert([{
          user_id: userId,
          client_id: newClient.id,
          status: 'ACTIVE'
        }]);

      if (relationError) {
        throw relationError;
      }

      return NextResponse.json({ 
        client: newClient,
        isExisting: false 
      }, { status: 201 });

    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      throw new Error('Error creating client relation');
    }

  } catch (error: unknown) {
    console.error('API Error:', error instanceof Error ? error.message : 'Unknown error');
    
    if (error && typeof error === 'object' && 'code' in error) {
      const dbError = error as DatabaseError;
      if (dbError.code === '22P02') {
        return NextResponse.json(
          { error: 'Error al procesar la relación cliente-usuario. Por favor, intente nuevamente.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: dbError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request): Promise<NextResponse> {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { data: clients, error: queryError } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (queryError) {
      throw queryError;
    }

    return NextResponse.json(clients);

  } catch (error: unknown) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    
    if (error && typeof error === 'object' && 'code' in error) {
      const dbError = error as DatabaseError;
      return NextResponse.json(
        { error: dbError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
