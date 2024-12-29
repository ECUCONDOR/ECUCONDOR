import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://adhivizuhfdxthpgqlxw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkaGl2aXp1aGZkeHRocGdxbHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA3MzQ0NjIsImV4cCI6MjA0NjMxMDQ2Mn0.kUsTt-JMqWsLiLzzx1ET-Js_r_x5qLnppSeSiKP9Q7E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
