import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface ClientData {
  first_name: string;
  last_name: string;
  identification: string;
  email: string;
  phone?: string;
  type?: 'personal' | 'business';
}

interface ValidationError {
  field: string;
  message: string;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone?: string): boolean {
  if (!phone) return true;
  const phoneRegex = /^\+?[\d\s-]{8,}$/;
  return phoneRegex.test(phone);
}

function validateIdentification(identification: string): boolean {
  // Assuming identification should be at least 5 characters and alphanumeric
  const idRegex = /^[a-zA-Z0-9]{5,}$/;
  return idRegex.test(identification);
}

function validateClientData(data: Partial<ClientData>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  if (!data.first_name?.trim()) {
    errors.push({ field: 'first_name', message: 'El nombre es requerido' });
  } else if (data.first_name.length < 2) {
    errors.push({ field: 'first_name', message: 'El nombre debe tener al menos 2 caracteres' });
  }

  if (!data.last_name?.trim()) {
    errors.push({ field: 'last_name', message: 'El apellido es requerido' });
  } else if (data.last_name.length < 2) {
    errors.push({ field: 'last_name', message: 'El apellido debe tener al menos 2 caracteres' });
  }

  if (!data.identification?.trim()) {
    errors.push({ field: 'identification', message: 'La identificación es requerida' });
  } else if (!validateIdentification(data.identification)) {
    errors.push({ field: 'identification', message: 'La identificación debe tener al menos 5 caracteres y ser alfanumérica' });
  }

  if (!data.email?.trim()) {
    errors.push({ field: 'email', message: 'El correo electrónico es requerido' });
  } else if (!validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'El correo electrónico no es válido' });
  }

  // Optional fields with format validation
  if (data.phone && !validatePhone(data.phone)) {
    errors.push({ field: 'phone', message: 'El teléfono debe tener al menos 8 dígitos y puede incluir +, espacios o guiones' });
  }

  if (data.type && !['personal', 'business'].includes(data.type)) {
    errors.push({ field: 'type', message: 'El tipo debe ser personal o business' });
  }

  return errors;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify user token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          error: 'No autorizado',
          code: 'UNAUTHORIZED',
          message: 'Token de autorización no proporcionado'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ 
          error: 'Token inválido',
          code: 'INVALID_TOKEN',
          message: 'El token de autorización no es válido o ha expirado'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const data: ClientData = await req.json()

      // Validate client data
      const validationErrors = validateClientData(data)
      if (validationErrors.length > 0) {
        return new Response(
          JSON.stringify({ 
            error: 'Datos inválidos',
            code: 'VALIDATION_ERROR',
            validationErrors 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check for duplicate identification
      const { data: existingClient, error: lookupError } = await supabaseAdmin
        .rpc('get_client_by_identification', { p_identification: data.identification })
        .single()

      if (lookupError) {
        console.error('Error checking for duplicate client:', lookupError)
        throw new Error('Error al verificar duplicados')
      }

      if (existingClient?.found) {
        return new Response(
          JSON.stringify({ 
            error: 'Cliente duplicado',
            code: 'DUPLICATE_CLIENT',
            message: 'Ya existe un cliente con esta identificación',
            clientId: existingClient.client_id
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create client
      const { data: client, error: insertError } = await supabaseAdmin
        .from('clients')
        .insert([{
          ...data,
          type: data.type || 'personal',
          created_by: user.id,
          updated_by: user.id
        }])
        .select()
        .single()

      if (insertError) {
        console.error('Error inserting client:', insertError)
        throw new Error('Error al crear el cliente en la base de datos')
      }

      // Create user-client relation
      const { error: relationError } = await supabaseAdmin
        .from('user_client_relation')
        .insert([{
          user_id: user.id,
          client_id: client.id,
          status: 'ACTIVE'
        }])

      if (relationError) {
        console.error('Error creating relation:', relationError)
        // Attempt to rollback client creation
        await supabaseAdmin
          .from('clients')
          .delete()
          .match({ id: client.id })
        throw new Error('Error al establecer la relación con el cliente')
      }

      return new Response(
        JSON.stringify({ 
          message: 'Cliente creado exitosamente',
          code: 'CLIENT_CREATED',
          client 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      const url = new URL(req.url)
      const identification = url.searchParams.get('identification')

      if (!identification) {
        // Get all clients for current user
        const { data: clients, error: fetchError } = await supabaseAdmin
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false })

        if (fetchError) {
          console.error('Error fetching clients:', fetchError)
          throw new Error('Error al obtener los clientes de la base de datos')
        }

        return new Response(
          JSON.stringify({ 
            message: 'Clientes obtenidos exitosamente',
            code: 'CLIENTS_FETCHED',
            clients: clients || [] 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        // Validate identification format
        if (!validateIdentification(identification)) {
          return new Response(
            JSON.stringify({ 
              error: 'Identificación inválida',
              code: 'INVALID_IDENTIFICATION',
              message: 'El formato de identificación no es válido'
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Get client by identification
        const { data: clientDetails, error: lookupError } = await supabaseAdmin
          .rpc('get_client_details_by_identification', { 
            p_identification: identification 
          })

        if (lookupError) {
          console.error('Error fetching client details:', lookupError)
          throw new Error('Error al obtener los detalles del cliente')
        }

        if (!clientDetails?.[0]) {
          return new Response(
            JSON.stringify({ 
              error: 'Cliente no encontrado',
              code: 'CLIENT_NOT_FOUND',
              message: 'No se encontró un cliente con la identificación proporcionada'
            }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ 
            message: 'Cliente encontrado',
            code: 'CLIENT_FOUND',
            client: clientDetails[0] 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ 
        error: 'Método no permitido',
        code: 'METHOD_NOT_ALLOWED',
        message: 'Este método HTTP no está soportado'
      }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Ha ocurrido un error inesperado',
        details: error.details || null
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
