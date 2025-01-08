import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ClientFormData } from '@/types/onboarding';
import crypto from 'crypto';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // 1. Check authentication
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
    console.log('User ID:', userId);

    // 2. Parse and validate request body
    const formData = await request.json();
    console.log('Received form data:', formData);

    // Validate required fields
    const requiredFields = ['name', 'identification', 'email', 'phone'];
    const missingFields = requiredFields.filter(field => !formData[field]?.trim());
    
    if (missingFields.length > 0) {
      throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
    }

    // 3. Check for existing client
    const { data: existingClient, error: searchError } = await supabase
      .from('clients')
      .select('*')
      .eq('identification', formData.identification.trim())
      .single();

    if (searchError && searchError.code !== 'PGRST116') {
      console.error('Search error:', searchError);
      throw searchError;
    }

    // If client exists, check/create relation and return
    if (existingClient) {
      console.log('Found existing client:', existingClient);

      try {
        // Check if relation already exists
        const { data: relations, error: relationCheckError } = await supabase
          .from('user_client_relation')
          .select('*')
          .eq('user_id', userId)
          .eq('client_id', existingClient.id);

        if (relationCheckError) {
          console.error('Relation check error:', relationCheckError);
          throw relationCheckError;
        }

        // If no relation exists, create one
        if (!relations?.length) {
          console.log('Creating new relation for existing client');
          const { error: relationError } = await supabase
            .from('user_client_relation')
            .insert([{
              user_id: userId,
              client_id: existingClient.id,
              status: 'ACTIVE'
            }]);

          if (relationError) {
            console.error('Relation creation error:', relationError);
            throw relationError;
          }
        } else {
          console.log('Relation already exists');
        }

        return NextResponse.json({ 
          client: existingClient,
          isExisting: true 
        });

      } catch (error) {
        console.error('Error handling relation:', error);
        throw error;
      }
    }

    // 4. Create new client
    const clientData = {
      name: formData.name.trim(),
      identification: formData.identification.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      type: formData.type || 'personal',
      address: formData.address?.trim(),
      created_by: userId
    };

    console.log('Creating new client with data:', clientData);
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert([clientData])
      .select()
      .single();

    if (clientError) {
      console.error('Client creation error:', clientError);
      throw clientError;
    }

    console.log('Created new client:', newClient);

    // 5. Create relation for new client
    try {
      const { error: relationError } = await supabase
        .from('user_client_relation')
        .insert([{
          user_id: userId,
          client_id: newClient.id,
          status: 'ACTIVE'
        }]);

      if (relationError) {
        console.error('Relation creation error:', relationError);
        throw relationError;
      }

      return NextResponse.json({ 
        client: newClient,
        isExisting: false 
      }, { status: 201 });

    } catch (error) {
      console.error('Error creating relation:', error);
      throw error;
    }

  } catch (error) {
    console.error('API Error:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      const dbError = error as { code: string; message: string };
      if (dbError.code === '22P02') {
        return NextResponse.json(
          { error: 'Error al procesar la relación cliente-usuario. Por favor, intente nuevamente.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 400 }
    );
  }
}

export async function GET(request: Request) {
  console.log('GET /api/clients - Iniciando solicitud');
  const supabase = createRouteHandlerClient({ cookies });

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

    // 2. Obtener clientes
    const { data: clients, error: queryError } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (queryError) {
      console.error('Error al obtener clientes:', queryError);
      throw queryError;
    }

    console.log(`Se encontraron ${clients?.length || 0} clientes`);
    return NextResponse.json({ clients });
  } catch (error) {
    console.error('Error general en GET /api/clients:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener los clientes',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
