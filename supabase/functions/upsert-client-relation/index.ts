import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

interface UpsertResponse {
  success: boolean
  message: string
  relation_id: string | null
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError) throw userError
    if (!user) throw new Error('No se encontró el usuario')

    // Obtener parámetros del body
    const { client_id, force_active = false } = await req.json()
    if (!client_id) {
      throw new Error('Se requiere client_id')
    }

    // Usar la función mejorada upsert_client_relation
    const { data, error } = await supabaseClient
      .rpc('upsert_client_relation', {
        p_user_id: user.id,
        p_client_id: client_id,
        p_force_active: force_active
      })

    if (error) throw error

    const response: UpsertResponse = {
      success: data?.[0]?.success ?? false,
      message: data?.[0]?.message ?? 'Error al actualizar la relación',
      relation_id: data?.[0]?.relation_id ?? null
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.success ? 200 : 400,
      }
    )

  } catch (error) {
    console.error('Error in upsert-client-relation:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido al actualizar la relación cliente',
        details: error instanceof Error ? error.stack : undefined,
        relation_id: null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
