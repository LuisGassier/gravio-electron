/**
 * Renumber January 2026 records with consecutive folios starting after December 2025
 * 
 * IMPORTANT: Uses Mexico time (UTC-6) to determine month boundaries!
 * 
 * Steps:
 * 1. Get all physical + virtual records from January 2026 (in Mexico time)
 * 2. Find last December 2025 folio (in Mexico time)
 * 3. Assign temporary folios (TEMP-0001, TEMP-0002, etc)
 * 4. Renumber to consecutive OOSL starting after last December folio
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.backfill' })
dotenv.config({ path: '.env' })

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const CLAVE_EMPRESA = 4
const DRY_RUN = process.env.DRY_RUN === 'true'

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
})

/**
 * Convert UTC timestamp to Mexico time (UTC-6) and return month/year
 */
function getMexicoDate(utcTimestamp: string): { date: Date; month: number; year: number } {
  const d = new Date(utcTimestamp)
  const mxDate = new Date(d.getTime() - 6 * 60 * 60 * 1000) // UTC-6
  return {
    date: mxDate,
    month: mxDate.getUTCMonth() + 1,
    year: mxDate.getUTCFullYear()
  }
}

async function renumber() {
  console.log('🔄 Renumerando folios de enero 2026 (HORA MÉXICO UTC-6)...')
  console.log(`   ${DRY_RUN ? '📋 MODO DRY RUN' : '🔥 MODO EJECUCIÓN'}\n`)

  try {
    // Step 1: Get LAST December 2025 folio (in Mexico time)
    console.log('📥 Buscando último folio de diciembre 2025 (hora México)...')
    const { data: decRecords, error: decError } = await supabase
      .from('registros')
      .select('id, folio, fecha_entrada')
      .eq('clave_empresa', CLAVE_EMPRESA)
      .gte('fecha_entrada', '2025-12-01T00:00:00Z')
      .lt('fecha_entrada', '2026-02-01T00:00:00Z')
      .order('fecha_entrada', { ascending: false })
      .limit(1000)

    if (decError) {
      console.error('❌ Error fetching records:', decError)
      process.exit(1)
    }

    let lastDecemberFolio = 0
    if (decRecords) {
      for (const r of decRecords) {
        const mxTime = getMexicoDate(r.fecha_entrada)
        if (mxTime.month === 12 && mxTime.year === 2025) {
          const folioNum = parseInt(r.folio.replace('OOSL-', '').replace('PALA-', ''), 10)
          lastDecemberFolio = Math.max(lastDecemberFolio, folioNum)
          console.log(`   ✓ Último de diciembre: ${r.folio} @ ${mxTime.date.toLocaleString()} (México)`)
          break
        }
      }
    }

    if (lastDecemberFolio === 0) {
      console.log('⚠️ No December 2025 records found in Mexico time')
      process.exit(1)
    }

    const startFolioNum = lastDecemberFolio + 1
    console.log(`✓ Enero 2026 comenzará en: OOSL-${String(startFolioNum).padStart(7, '0')}\n`)

    // Step 2: Get all January 2026 records (in Mexico time)
    console.log('📥 Obteniendo registros de enero 2026 (hora México)...')
    const { data: janRecords, error: janError } = await supabase
      .from('registros')
      .select('id, folio, fecha_entrada, numero_economico')
      .eq('clave_empresa', CLAVE_EMPRESA)
      .gte('fecha_entrada', '2025-12-31T06:00:00Z')  // Dec 31 @ 6am UTC = Jan 1 @ 12am México
      .lt('fecha_entrada', '2026-02-01T06:00:00Z')   // Feb 1 @ 6am UTC = Feb 1 @ 12am México
      .order('fecha_entrada', { ascending: true })

    if (janError) {
      console.error('❌ Error fetching records:', janError)
      process.exit(1)
    }

    if (!janRecords || janRecords.length === 0) {
      console.log('⚠️ No records found for January 2026 (Mexico time)')
      process.exit(0)
    }

    // Filter to ensure all are actually January in Mexico time
    const januaryRecords = janRecords.filter(r => {
      const mxTime = getMexicoDate(r.fecha_entrada)
      return mxTime.month === 1 && mxTime.year === 2026
    })

    console.log(`✓ ${januaryRecords.length} registros de enero 2026 (hora México)\n`)

    // Step 3: Assign temporary folios
    console.log('1️⃣ Asignando folios temporales...')
    const updates = januaryRecords.map((r, i) => ({
      id: r.id,
      folio: `TEMP-${String(i + 1).padStart(4, '0')}`,
      originalFolio: r.folio,
      position: i
    }))

    if (!DRY_RUN) {
      for (const update of updates) {
        const { error } = await supabase
          .from('registros')
          .update({ folio: update.folio })
          .eq('id', update.id)

        if (error) {
          console.error(`❌ Error updating record ${update.id}:`, error)
          process.exit(1)
        }
      }
      console.log(`✓ ${januaryRecords.length} folios temporales asignados\n`)
    } else {
      console.log(`[DRY] Se asignarían ${januaryRecords.length} folios temporales\n`)
    }

    // Step 4: Renumber to consecutive OOSL folios
    console.log('2️⃣ Renumerando a folios consecutivos OOSL...')
    const finalUpdates = januaryRecords.map((r, i) => ({
      id: r.id,
      newFolio: `OOSL-${String(startFolioNum + i).padStart(7, '0')}`,
      oldFolio: updates[i].folio,
      position: i + 1
    }))

    if (!DRY_RUN) {
      for (const update of finalUpdates) {
        const { error } = await supabase
          .from('registros')
          .update({ folio: update.newFolio })
          .eq('id', update.id)

        if (error) {
          console.error(`❌ Error renumbering record ${update.id}:`, error)
          process.exit(1)
        }
      }
    }

    // Display results
    console.log('✓ Folios renumerados exitosamente\n')
    console.log('📊 Resultado final:')
    console.log(`   Primer folio: ${finalUpdates[0].newFolio}`)
    console.log(`   Último folio: ${finalUpdates[finalUpdates.length - 1].newFolio}`)
    console.log(`   Total: ${finalUpdates.length} registros`)
    console.log(`\n   Ejemplo de registros (hora México):`)
    
    // Show sample
    const samples = [
      finalUpdates[0],
      finalUpdates[Math.floor(finalUpdates.length / 2)],
      finalUpdates[finalUpdates.length - 1]
    ]

    samples.forEach(s => {
      const origRecord = januaryRecords[s.position - 1]
      const mxTime = getMexicoDate(origRecord.fecha_entrada)
      console.log(`   ${s.position}: ${s.newFolio} @ ${mxTime.date.toLocaleString()} (${origRecord.numero_economico})`)
    })

    console.log('\n✨ ¡Completado!')
    if (DRY_RUN) {
      console.log('   (sin cambios en BD)')
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

renumber().catch(console.error)
