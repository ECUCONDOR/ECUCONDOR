import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface Client {
  id?: string
  first_name: string
  last_name: string
  identification: string
  email: string
  phone?: string
  address?: string
  created_by?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Obtener el token de autorización
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Configurar el cliente con el token
    supabaseClient.auth.setSession(authHeader.replace('Bearer ', ''))

    switch (req.method) {
      case 'GET': {
        const { data: clients, error } = await supabaseClient
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        return new Response(
          JSON.stringify({ clients }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'POST': {
        const client: Client = await req.json()
        
        // Validar campos requeridos
        if (!client.first_name || !client.last_name || !client.identification || !client.email) {
          return new Response(
            JSON.stringify({ error: 'Faltan campos requeridos' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Obtener el usuario actual
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) {
          throw new Error('No se pudo obtener el usuario actual')
        }

        // Agregar el created_by
        client.created_by = user.id

        const { data, error } = await supabaseClient
          .from('clients')
          .insert([client])
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ client: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Método no permitido' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
