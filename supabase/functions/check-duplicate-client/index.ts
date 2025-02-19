import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('MY_SUPABASE_URL') ?? '',
      Deno.env.get('MY_SUPABASE_ANON_KEY') ?? ''
    )

    const { identification } = await req.json()
    
    if (!identification) {
      return new Response(
        JSON.stringify({ error: 'identification is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    const { data, error } = await supabaseClient
      .rpc('get_client_by_identification', {
        p_identification: identification
      })

    if (error) throw error

    return new Response(
      JSON.stringify({ exists: !!data, client: data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})