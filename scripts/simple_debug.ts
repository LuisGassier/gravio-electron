
console.log('Starting debug script...');
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL) { console.log('No URL'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

supabase.from('registros').select('count', { count: 'exact' }).eq('clave_empresa', 4).gte('fecha_entrada', '2025-12-01').then(({ count, error }) => {
    if (error) console.error(error);
    console.log('Count:', count);
}).catch(e => console.error(e));
