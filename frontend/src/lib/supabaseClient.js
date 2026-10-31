
import { createClient } from '@supabase/supabase-js';

// POR LO MIENTRAS
// Las credenciales se configurarán cuando nuestro tengamos los datos del proyecto Supabase.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Evitamos inicializar Supabase con variables vacías.
export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;
