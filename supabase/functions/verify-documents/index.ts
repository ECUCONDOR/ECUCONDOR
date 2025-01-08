import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders, supabaseConfig } from '../shared/config.ts'

interface VerificationRequest {
  userId: string
  clientId: string
  documents: {
    type: 'id' | 'address' | 'business' | 'other'
    path: string
  }[]
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      supabaseConfig.supabaseUrl,
      supabaseConfig.supabaseKey
    )

    const { userId, clientId, documents } = await req.json() as VerificationRequest

    // Validate request
    if (!userId || !clientId || !documents?.length) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify user exists and has access to client
    const { data: userClient, error: userClientError } = await supabase
      .from('user_client_relations')
      .select('*')
      .eq('user_id', userId)
      .eq('client_id', clientId)
      .single()

    if (userClientError || !userClient) {
      return new Response(
        JSON.stringify({ error: 'Invalid user-client relationship' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Process each document
    const processedDocs = await Promise.all(
      documents.map(async (doc) => {
        // Create document record
        const { data: docData, error: docError } = await supabase
          .from('verification_documents')
          .insert({
            type: doc.type,
            path: doc.path,
            status: 'pending'
          })
          .select()
          .single()

        if (docError) throw docError

        return docData
      })
    )

    // Update verification status
    const { data: verificationStatus, error: verificationError } = await supabase
      .from('verification_status')
      .upsert({
        user_id: userId,
        client_id: clientId,
        documents: processedDocs,
        status: 'pending'
      })
      .select()
      .single()

    if (verificationError) throw verificationError

    // Create initial permissions
    const { error: permissionError } = await supabase
      .from('user_permissions')
      .upsert({
        user_id: userId,
        client_id: clientId,
        role: 'member'
      })

    if (permissionError) throw permissionError

    return new Response(
      JSON.stringify({
        status: 'success',
        data: verificationStatus
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
