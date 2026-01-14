
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const CLAVE_EMPRESA = 4

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function debug() {
  console.log('--- Analyzing Records for Dec 2025 ---')
  const { data: records, error } = await supabase
    .from('registros')
    .select('registrado_por')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', '2025-12-01')
    .lte('fecha_entrada', '2026-01-01')

  if (error) { console.error(error); return; }
  
  const counts: Record<string, number> = {}
  records.forEach(r => {
      const k = r.registrado_por || 'NULL'
      counts[k] = (counts[k] || 0) + 1
  })
  
  console.log('Distribution by registrado_por:')
  console.table(counts)
}

debug()
