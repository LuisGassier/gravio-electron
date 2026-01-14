
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const CLAVE_EMPRESA = 4

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function debug() {
  const { data: records } = await supabase
    .from('registros')
    .select('id, fecha_entrada, registrado_por, peso_neto, folio')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', '2025-12-01')
    .lte('fecha_entrada', '2026-01-01')
    .order('fecha_entrada', { ascending: true })

  if (!records) return

  console.log(`Total records: ${records.length}`)
  
  // Group by rough timestamp (minute precision) and vehicle? Or just listing a sample.
  // Let's count by registrado_por
  const counts: Record<string, number> = {}
  records.forEach(r => {
      const k = r.registrado_por || 'NULL'
      counts[k] = (counts[k] || 0) + 1
  })
  console.log('Counts by registrado_por:', counts)

  // Show first few duplicates
  console.log('Sample records:')
  records.slice(0, 10).forEach(r => console.log(`${r.fecha_entrada} | ${r.folio} | ${r.registrado_por} | ${r.peso_neto}`))
}

debug()
