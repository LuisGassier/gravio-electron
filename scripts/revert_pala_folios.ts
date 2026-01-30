/**
 * Revert PALA folios Script
 * 
 * Revierte los folios PALA que fueron cambiados incorrectamente
 * OOSL-0000591 a OOSL-0000678 vuelven a ser PALA-0000001 a PALA-0000088
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

async function revertPalaFolios() {
  console.log('🔄 Revirtiendo folios PALA...')

  try {
    // Traer registros OOSL-0000591 a OOSL-0000678 (que fueron PALA-*)
    const { data: registros, error: fetchError } = await supabase
      .from('registros')
      .select('id, folio')
      .gte('folio', 'OOSL-0000591')
      .lte('folio', 'OOSL-0000678')
      .order('folio', { ascending: true })

    if (fetchError) throw fetchError

    if (!registros || registros.length === 0) {
      console.log('✅ No hay registros OOSL-0000591 a OOSL-0000678')
      return
    }

    console.log(`📊 Encontrados ${registros.length} registros a revertir`)

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < registros.length; i++) {
      const oldFolio = registros[i].folio
      // OOSL-0000591 → PALA-0000001
      // OOSL-0000592 → PALA-0000002
      // etc.
      const palaNum = i + 1
      const newFolio = `PALA-${String(palaNum).padStart(7, '0')}`

      const { error: updateError } = await supabase
        .from('registros')
        .update({ folio: newFolio })
        .eq('id', registros[i].id)

      if (updateError) {
        console.error(`❌ Error al revertir ${oldFolio} → ${newFolio}: ${updateError.message}`)
        errorCount++
      } else {
        console.log(`✓ ${oldFolio} → ${newFolio}`)
        successCount++
      }
    }

    console.log(`\n✅ Reversión completada:`)
    console.log(`   Actualizados: ${successCount}`)
    console.log(`   Errores: ${errorCount}`)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

revertPalaFolios()
