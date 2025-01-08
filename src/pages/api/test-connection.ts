import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Database } from '@/types/supabase';
import { cors } from '@/lib/middleware';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Testing Supabase connection...');
    
    // 1. Test authentication status
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Auth error:', authError);
      return res.status(500).json({ 
        error: 'Authentication error',
        details: authError,
        env: {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      });
    }

    // 2. Test public access to profiles (should work even without auth)
    const { data: publicData, error: publicError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (publicError) {
      console.error('Public access error:', publicError);
      return res.status(500).json({ 
        error: 'Error accessing public data',
        details: publicError,
        env: {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      });
    }

    // 3. If authenticated, test access to own profile
    let privateData = null;
    let privateError = null;
    
    if (session?.user?.id) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      privateData = data;
      privateError = error;
    }

    console.log('Successfully tested Supabase connection');
    res.status(200).json({ 
      success: true,
      auth: {
        session: session ? 'Active' : 'None',
        userId: session?.user?.id,
      },
      data: {
        publicAccess: {
          success: true,
          profiles: publicData?.length || 0
        },
        privateAccess: privateData ? {
          success: true,
          profile: privateData
        } : {
          success: false,
          error: privateError
        }
      },
      env: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ 
      error: 'Unexpected error occurred',
      details: err instanceof Error ? err.message : String(err)
    });
  }
}
