
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const CLAVE_EMPRESA = 4

// Rango de Diciembre 2025
const START_DATE = '2025-12-01T00:00:00-06:00'
const END_DATE = '2025-12-31T05:59:59-06:00' // Ajuste para cubrir todo el mes en esa zona horaria

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Faltan variables de entorno SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
})

function formatFolio(numero: number): string {
  return `OOSL-${numero.toString().padStart(7, '0')}`
}

async function run() {
  console.log('🔄 Iniciando renumeración de folios para TODA la empresa 4...')
  
  // 1. Obtener todos los registros (físicos y virtuales) de la empresa 4
  const { data: records, error } = await supabase
    .from('registros')
    .select('id, fecha_entrada, folio')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .order('fecha_entrada', { ascending: true }) // Orden CRONOLÓGICO real del evento

  if (error) {
    console.error('❌ Error al obtener registros:', error)
    process.exit(1)
  }

  console.log(`📄 Registros encontrados: ${records.length}`)

  if (records.length === 0) {
    console.log('⚠️ No hay registros para renumerar.')
    return
  }

  // 2. Preparar actualizaciones
  // PASO PREVIO: Renombrar a temporal para evitar colisiones de Unique Constraint
  console.log('🧹 Limpiando folios existentes (fase temporal) para evitar colisiones...')
  
  const tempUpdates = records.map((r, idx) => ({
      id: r.id,
      // Format: T-00001 (short, safe)
      folio: `T-${(idx+1).toString().padStart(5, '0')}` 
  }))

  // Actualizar a temporales - SEQUENTIAL
  for (const u of tempUpdates) {
      const { error } = await supabase.from('registros').update({ folio: u.folio }).eq('id', u.id)
      if (error) {
          console.error(`❌ Error setting TEMP folio for ${u.id}:`, error)
      }
      process.stdout.write('T')
  }
  console.log('\n✅ Folios temporales asignados.')

  console.log('🔢 Asignando folios definitivos consecutivos (OOSL-0000001 en adelante)...')
  
  const updates = records.map((record, index) => ({
    id: record.id,
    folio: formatFolio(index + 1)
  }))

  console.log(`   Ejemplo inicio: ${updates[0].folio} -> ID ${updates[0].id}`)
  console.log(`   Ejemplo fin:    ${updates[updates.length - 1].folio} -> ID ${updates[updates.length - 1].id}`)

  // 3. Ejecutar actualizaciones usando UPDATE directo registro por registro
  // Upsert falla porque intenta insertar si no existe y requiere campos not-null que no estamos enviando.
  // Para actualización masiva parcial, upsert necesita todos los campos obligatorios o ser un update explícito.
  console.log(`💾 Guardando cambios (update one-by-one)...`)
  
  let successCount = 0
  let errorCount = 0

  // Paralelismo limitado para mayor velocidad
  const concurrency = 20
  for (let i = 0; i < updates.length; i += concurrency) {
      const chunk = updates.slice(i, i + concurrency)
      
      await Promise.all(chunk.map(async (update) => {
          const { error } = await supabase
              .from('registros')
              .update({ folio: update.folio })
              .eq('id', update.id)
          
          if (error) {
              console.error(`❌ Error actualizando ${update.id}:`, error.message)
              errorCount++
          } else {
              successCount++
          }
      }))
      
      process.stdout.write('.')
  }

  console.log(`\n✅ Proceso finalizado. Completados: ${successCount}, Errores: ${errorCount}`)
}

run().catch(err => {
  console.error('❌ Error fatal:', err)
  process.exit(1)
})
