/**
 * Check Generated Records for January 2026
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

async function checkRecords() {
  console.log('📊 Verificando registros generados en Enero 2026...')

  try {
    const januaryStartUTC = new Date('2026-01-01T06:00:00Z')
    const februaryStartUTC = new Date('2026-02-01T06:00:00Z')

    const { data: registros, error } = await supabase
      .from('registros')
      .select('id, folio, fecha_registro, registrado_por')
      .eq('clave_empresa', 4)
      .eq('registrado_por', 'SYSTEM_GENERATED_OOSLMP_BACKFILL_2026')
      .gte('fecha_registro', januaryStartUTC.toISOString())
      .lt('fecha_registro', februaryStartUTC.toISOString())

    if (error) throw error

    console.log(`✅ Encontrados ${registros?.length || 0} registros SYSTEM_GENERATED en Enero 2026`)
    
    if (registros && registros.length > 0) {
      console.log(`   Primero: ${registros[0].folio}`)
      console.log(`   Último: ${registros[registros.length - 1].folio}`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

checkRecords()
