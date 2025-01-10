declare module 'https://deno.land/std@0.177.0/http/server.ts' {
  export interface Request extends globalThis.Request {
    // Add any additional properties specific to Deno's Request
  }
  
  export interface Response extends globalThis.Response {
    // Add any additional properties specific to Deno's Response
  }
}

declare module 'https://esm.sh/@supabase/supabase-js@2.7.1' {
  export * from '@supabase/supabase-js'
}
