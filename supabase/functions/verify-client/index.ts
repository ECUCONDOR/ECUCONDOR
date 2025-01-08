import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

interface VerifyClientRequest {
  userId: string
  clientId: string
  verificationId: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId, clientId, verificationId } = await req.json() as VerifyClientRequest

    // Validate request
    if (!userId || !clientId || !verificationId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get verification status
    const { data: verification, error: verificationError } = await supabase
      .from('verification_status')
      .select('*')
      .eq('id', verificationId)
      .eq('user_id', userId)
      .eq('client_id', clientId)
      .single()

    if (verificationError || !verification) {
      return new Response(
        JSON.stringify({ error: 'Verification not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify all documents are present
    const requiredDocs = verification.documents.filter(
      (doc: any) => doc.type === 'id' || doc.type === 'address'
    )

    if (requiredDocs.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Missing required documents' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Update verification status
    const { data: updatedVerification, error: updateError } = await supabase
      .from('verification_status')
      .update({
        status: 'verified',
        updated_at: new Date().toISOString()
      })
      .eq('id', verificationId)
      .select()
      .single()

    if (updateError) throw updateError

    // Update user permissions to admin if they're the first verified user for this client
    const { data: existingAdmins } = await supabase
      .from('user_permissions')
      .select('id')
      .eq('client_id', clientId)
      .eq('role', 'admin')

    if (!existingAdmins?.length) {
      await supabase
        .from('user_permissions')
        .update({ role: 'admin' })
        .eq('user_id', userId)
        .eq('client_id', clientId)
    }

    return new Response(
      JSON.stringify({
        status: 'success',
        data: updatedVerification
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
