import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export async function testTransfer(
  fromWalletId: string,
  toWalletId: string,
  amount: number,
  description?: string
) {
  const supabase = createClientComponentClient()
  
  // Get the session
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('No session found')
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/test-transfer`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        fromWalletId,
        toWalletId,
        amount,
        description,
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al realizar la transferencia')
  }

  return response.json()
}
