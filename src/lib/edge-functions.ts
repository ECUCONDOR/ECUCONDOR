import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export async function invokeEdgeFunction(functionName: string, options?: { 
  body?: any 
}) {
  const supabase = createClientComponentClient()
  
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.error('Session error:', sessionError)
      throw new Error('Error de sesión: ' + sessionError.message)
    }
    if (!session?.access_token) {
      console.error('No session found')
      throw new Error('No hay una sesión activa')
    }

    const functionsUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL
    if (!functionsUrl) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL environment variable')
    }

    // Call the edge function with auth header
    const response = await fetch(
      `${functionsUrl}/${functionName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: options?.body ? JSON.stringify(options.body) : null,
      }
    )

    const responseData = await response.json()

    if (!response.ok) {
      console.error(`Edge function error (${response.status}):`, responseData)
      throw new Error(responseData.error || `Error ${response.status}: ${response.statusText}`)
    }

    return responseData
  } catch (error) {
    console.error(`Error calling edge function ${functionName}:`, error)
    throw error instanceof Error ? error : new Error('Error desconocido')
  }
}
