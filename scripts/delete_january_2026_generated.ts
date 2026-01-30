/**
 * Delete Generated Records for January 2026 - Company 4 Only
 * 
 * Removes only the OOSLMP_BACKFILL records from January 2026 for clave_empresa = 4
 * 
 * Usage:
 *   npx ts-node scripts/delete_january_2026_generated.ts
 */

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.backfill' })
dotenv.config({ path: '.env' })

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function deleteJanuaryGenerated() {
  console.log('🗑️  Borrando registros generados de Enero 2026 (clave_empresa 4)...')

  try {
    // January 2026 en México (UTC-6)
    // Inicio: 2026-01-01 00:00:00 MX = 2026-01-01 06:00:00 UTC
    // Fin: 2026-02-01 00:00:00 MX = 2026-02-01 06:00:00 UTC
    const januaryStartUTC = new Date('2026-01-01T06:00:00Z')
    const februaryStartUTC = new Date('2026-02-01T06:00:00Z')

    // Query for January 2026 generated records for company 4
    const { data: registros, error: fetchError } = await supabase
      .from('registros')
      .select('id, folio, fecha_registro')
      .eq('clave_empresa', 4)
      .eq('registrado_por', 'SYSTEM_GENERATED_OOSLMP_BACKFILL_2026')
      .gte('fecha_registro', januaryStartUTC.toISOString())
      .lt('fecha_registro', februaryStartUTC.toISOString())

    if (fetchError) throw fetchError

    if (!registros || registros.length === 0) {
      console.log('✅ No hay registros generados en Enero 2026 para empresa 4')
      return
    }

    console.log(`📊 Encontrados ${registros.length} registros a borrar`)
    console.log(`   Rango de folios: ${registros[0].folio} a ${registros[registros.length - 1].folio}`)

    // Delete records
    const ids = registros.map(r => r.id)
    const { error: deleteError } = await supabase
      .from('registros')
      .delete()
      .in('id', ids)

    if (deleteError) throw deleteError

    console.log(`\n✅ Se eliminaron ${registros.length} registros generados de Enero 2026`)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

deleteJanuaryGenerated()
