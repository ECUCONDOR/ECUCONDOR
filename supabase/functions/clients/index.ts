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
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const data: ClientData = await req.json()

      // Validate required fields
      const requiredFields = ['first_name', 'last_name', 'identification', 'email']
      for (const field of requiredFields) {
        if (!data[field]) {
          return new Response(
            JSON.stringify({ error: `El campo ${field} es requerido` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      // Check for duplicate identification
      const { data: existingClient } = await supabaseAdmin
        .rpc('get_client_by_identification', { p_identification: data.identification })
        .single()

      if (existingClient?.found) {
        return new Response(
          JSON.stringify({ 
            error: 'Ya existe un cliente con esta identificación',
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

      if (insertError) throw insertError

      // Create user-client relation
      const { error: relationError } = await supabaseAdmin
        .from('user_client_relation')
        .insert([{
          user_id: user.id,
          client_id: client.id,
          status: 'ACTIVE'
        }])

      if (relationError) throw relationError

      return new Response(
        JSON.stringify({ client }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      const url = new URL(req.url)
      const identification = url.searchParams.get('identification')

      if (!identification) {
        // Get all clients for current user
        const { data: clients, error } = await supabaseAdmin
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        return new Response(
          JSON.stringify({ clients: clients || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        // Get client by identification
        const { data: clientDetails, error } = await supabaseAdmin
          .rpc('get_client_details_by_identification', { 
            p_identification: identification 
          })

        if (error) throw error

        if (!clientDetails?.[0]) {
          return new Response(
            JSON.stringify({ error: 'Cliente no encontrado' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ client: clientDetails[0] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Método no permitido' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
