import { createClient } from '@supabase/supabase-js';

// Substitua com suas credenciais do Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://qfnibnhjdnczxoublxif.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_rZf4HnUkAiO16oaQwserjg_Axj-2BwL';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
