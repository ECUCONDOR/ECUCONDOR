export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

export const supabaseConfig = {
  supabaseUrl: 'https://adhivizuhfdxthpgqlxw.supabase.co',
  supabaseKey: Deno.env.get('SERVICE_ROLE_KEY') ?? ''
}

export const jwtSecret = '2rmJDkdvO9IZw9vEYBrflV8zseIzBNrBZA8sW8tILgTUuzdRtZCPQMOdQRbeTAXLa4ew0lHNak3P2wg83aWyqw=='
