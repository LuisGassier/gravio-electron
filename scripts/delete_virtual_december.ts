
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const CLAVE_EMPRESA = 4

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false }
})

async function run() {
  console.log('🗑️  Deleting virtual records for December 2025...')
  
  // Explicitly target the signature we found
  const TARGET_SIGNATURE = 'SYSTEM_GENERATED_OOSLMP_BACKFILL_2025'

  // Get count first
  const { count, error: countError } = await supabase
    .from('registros')
    .select('*', { count: 'exact', head: true })
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', '2025-12-01')
    .lte('fecha_entrada', '2026-01-01')
    .eq('registrado_por', TARGET_SIGNATURE)

  if (countError) throw countError
  console.log(`Found ${count} records to delete.`)

  if (count === 0) {
      console.log('Nothing to delete.')
      return
  }

  // Delete in batches? Supabase might timeout on huge deletes but 400 is fine.
  const { error } = await supabase
    .from('registros')
    .delete()
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', '2025-12-01')
    .lte('fecha_entrada', '2026-01-01')
    .eq('registrado_por', TARGET_SIGNATURE)

  if (error) {
      console.error('❌ Error deleting:', error)
  } else {
      console.log('✅ Successfully deleted all virtual records.')
  }
}

run().catch(console.error)
