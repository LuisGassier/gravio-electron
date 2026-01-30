/**
 * Fix Folio Gap Script
 * 
 * Desplaza los folios desde OOSL-0000529 hacia arriba para ocupar el hueco
 * Convierte OOSL-0000529 → OOSL-0000315, OOSL-0000530 → OOSL-0000316, etc.
 * 
 * Usage:
 *   npx ts-node scripts/fix_folio_gap.ts
 */

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment
dotenv.config({ path: '.env.backfill' })
dotenv.config({ path: '.env' })

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function fixFolioGap() {
  console.log('🔧 Iniciando corrección de hueco de folios...')
  console.log('   Desplazando OOSL-0000529+ → OOSL-0000315+')

  try {
    // Get all records with folio >= 529
    const { data: registros, error: fetchError } = await supabase
      .from('registros')
      .select('id, folio')
      .gte('folio', 'OOSL-0000529')
      .order('folio', { ascending: true })

    if (fetchError) throw fetchError

    if (!registros || registros.length === 0) {
      console.log('✅ No hay registros con folio >= OOSL-0000529')
      return
    }

    console.log(`📊 Encontrados ${registros.length} registros a desplazar`)

    const startFolio = 315
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < registros.length; i++) {
      const oldFolio = registros[i].folio
      const newFolioNum = startFolio + i
      const newFolio = `OOSL-${String(newFolioNum).padStart(7, '0')}`

      const { error: updateError } = await supabase
        .from('registros')
        .update({ folio: newFolio })
        .eq('id', registros[i].id)

      if (updateError) {
        console.error(`❌ Error al actualizar ${oldFolio} → ${newFolio}: ${updateError.message}`)
        errorCount++
      } else {
        console.log(`✓ ${oldFolio} → ${newFolio}`)
        successCount++
      }
    }

    console.log(`\n✅ Corrección completada:`)
    console.log(`   Actualizados: ${successCount}`)
    console.log(`   Errores: ${errorCount}`)
    console.log(`   Nuevo rango: OOSL-0000315 a OOSL-${String(startFolio + registros.length - 1).padStart(7, '0')}`)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

fixFolioGap()
