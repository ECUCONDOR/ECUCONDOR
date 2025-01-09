declare module '../../context/NotificationContext';
declare module '../../api/auth';

// Add missing module declarations
declare module 'webxr';
declare module '@supabase/auth-helpers-nextjs';
declare module '@supabase/supabase-js';
declare module 'three';
declare module 'd3';
declare module 'phoenix';
declare module 'nodemailer';
declare module 'ws';
declare module 'stats.js';
declare module 'prop-types';
declare module 'handlebars';
declare module 'body-parser';
declare module 'cookie';
declare module 'json5';
declare module 'qs';
declare module 'range-parser';
declare module 'scheduler';
declare module 'send';
declare module 'serve-static';
declare module 'uuid';

// Add any environment variables type declarations
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    [key: string]: string | undefined;
  }
}
