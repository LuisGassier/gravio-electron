
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const CLAVE_EMPRESA = 4
const TARGET_KG = 2751370 // 2,751.37 tons

// Rango de Diciembre 2025
const START_DATE = '2025-12-01T00:00:00-06:00'
const END_DATE = '2025-12-31T23:59:59-06:00'

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Faltan variables de entorno')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false }
})

function roundTo10(num: number): number {
    return Math.round(num / 10) * 10
}

async function run() {
  console.log('🔄 Iniciando ajuste de pesos físicos y balanceo final...')

  // 1. Obtener registros
  const { data: records, error } = await supabase
    .from('registros')
    .select('*')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', START_DATE)
    .lte('fecha_entrada', END_DATE)
    .order('fecha_entrada', { ascending: true })

  if (error) {
      console.error('❌ Error obteniendo registros:', error)
      process.exit(1)
  }

  console.log(`📄 Registros recuperados: ${records.length}`)

  let conversionUpdates: any[] = []
  let currentTotalKg = 0
  let physicalCount = 0
  let virtualCount = 0
  let virtualRecordsIndices: number[] = []

  // 2. Procesar físicos (redondear) y calcular totales actuales
  for (let i = 0; i < records.length; i++) {
      const r = records[i]
      const isVirtual = r.registrado_por && r.registrado_por.includes('SYSTEM_GENERATED')
      
      let newEntrada = r.peso_entrada
      let newSalida = r.peso_salida
      let newNeto = r.peso // Column is 'peso', not 'peso_neto'
      let needsUpdate = false

      if (isVirtual) {
          virtualCount++
          virtualRecordsIndices.push(i)
      } else {
          physicalCount++
          // Regla: Físicos se redondean a 10
          const roundedEntrada = roundTo10(r.peso_entrada)
          const roundedSalida = roundTo10(r.peso_salida)
          
          if (roundedEntrada !== r.peso_entrada || roundedSalida !== r.peso_salida) {
              newEntrada = roundedEntrada
              newSalida = roundedSalida
              newNeto = newEntrada - newSalida
              needsUpdate = true
          }
      }

      // Si se necesita update, lo agendamos
      if (needsUpdate) {
          conversionUpdates.push({
              id: r.id,
              peso_entrada: newEntrada,
              peso_salida: newSalida,
              peso: newNeto,
              tipo: 'PHYSICAL_ROUNDING'
          })
          // Actualizamos el objeto en memoria para el cálculo final
          records[i].peso_entrada = newEntrada
          records[i].peso_salida = newSalida
          records[i].peso = newNeto
      }

      currentTotalKg += records[i].peso
  }

  console.log(`📊 Estado Inicial (Simulado tras redondeo físico):`)
  console.log(`   Físicos: ${physicalCount}`)
  console.log(`   Virtuales: ${virtualCount}`)
  console.log(`   Suma Total Actual: ${(currentTotalKg / 1000).toFixed(2)} tons (${currentTotalKg} kg)`)
  console.log(`   Meta: ${(TARGET_KG / 1000).toFixed(2)} tons (${TARGET_KG} kg)`)

  // 3. Calcular Ajuste Necesario y Distribuir
  // Primero: Corregir negativos (resetear a valor seguro para redistribuir el exceso)
  for (let i = 0; i < records.length; i++) {
      if (records[i].peso < 0) {
          console.warn(`🔄 Reseteando registro negativo ${records[i].folio} (${records[i].peso} kg) para redistribución...`)
          const saneValue = 5000 // 5 tons default para que sea positivo
          // Ajustamos currentTotal quitando el negativo y poniendo el saneValue
          currentTotalKg = currentTotalKg - records[i].peso + saneValue
          
          records[i].peso = saneValue
          records[i].peso_entrada = records[i].peso_salida + saneValue
          
          conversionUpdates.push({
              id: records[i].id,
              peso_entrada: records[i].peso_entrada,
              peso_salida: records[i].peso_salida,
              peso: records[i].peso,
              tipo: 'NEGATIVE_FIX'
          })
      }
  }

  const matchesMeta = Math.abs(TARGET_KG - currentTotalKg) < 1 // Tolerancia pequeña
  const finalDiff = TARGET_KG - currentTotalKg
  console.log(`⚖️  Diferencia Real (tras corrección negativos): ${finalDiff} kg`)

  if (Math.abs(finalDiff) > 0) {
      if (virtualRecordsIndices.length === 0) {
          console.error('❌ No hay virtuales para ajustar.')
          return
      }

      console.log(`📦 Distribuyendo ${finalDiff} kg entre ${virtualRecordsIndices.length} registros virtuales...`)
      
      // Cálculo de distribución
      // Base por registro (redondeado a 10)
      const rawShare = finalDiff / virtualRecordsIndices.length
      const roundedShare = Math.floor(rawShare / 10) * 10
      
      let distributedSoFar = 0

      // Aplicar share a todos excepto el último
      for (let i = 0; i < virtualRecordsIndices.length - 1; i++) {
          const idx = virtualRecordsIndices[i]
          const r = records[idx]
          
          const newNeto = r.peso + roundedShare
          const newEntrada = r.peso_entrada + roundedShare
          
          distributedSoFar += roundedShare

          // Actualizar en updates
          const existing = conversionUpdates.find(u => u.id === r.id)
          if (existing) {
              existing.peso = newNeto
              existing.peso_entrada = newEntrada
              existing.tipo = 'DISTRIBUTION'
          } else {
              conversionUpdates.push({
                  id: r.id,
                  peso_entrada: newEntrada,
                  peso_salida: r.peso_salida,
                  peso: newNeto,
                  tipo: 'DISTRIBUTION'
              })
          }
      }

      // El último se lleva el resto para cuadrar exacto
      const remaining = finalDiff - distributedSoFar
      const lastIdx = virtualRecordsIndices[virtualRecordsIndices.length - 1]
      const lastR = records[lastIdx]
      
      const lastNeto = lastR.peso + remaining
      const lastEntrada = lastR.peso_entrada + remaining
      
      console.log(`🏁 Ajuste final en último registro (${lastR.folio}): ${remaining} kg`)
      
      const existingLast = conversionUpdates.find(u => u.id === lastR.id)
      if (existingLast) {
          existingLast.peso = lastNeto
          existingLast.peso_entrada = lastEntrada
          existingLast.tipo = 'FINAL_REMAINDER'
      } else {
          conversionUpdates.push({
              id: lastR.id,
              peso_entrada: lastEntrada,
              peso_salida: lastR.peso_salida,
              peso: lastNeto,
              tipo: 'FINAL_REMAINDER'
          })
      }

  } else {
      console.log('✅ Balance perfecto.')
  }

  // 4. Ejecutar Updates
  if (conversionUpdates.length === 0) {
      console.log('✅ Nada que actualizar.')
      return
  }

  console.log(`💾 Aplicando ${conversionUpdates.length} actualizaciones...`)
  
  // Batch process
  let processed = 0
  let errors = 0
  
  for (let i = 0; i < conversionUpdates.length; i += 20) {
      const chunk = conversionUpdates.slice(i, i + 20)
      await Promise.all(chunk.map(async (u) => {
          const { error } = await supabase
              .from('registros')
              .update({
                  peso_entrada: u.peso_entrada,
                  peso_salida: u.peso_salida,
                  peso: u.peso // Column is 'peso'
              })
              .eq('id', u.id)
          
          if (error) {
              console.error(`❌ Error actualizando ${u.id}:`, error.message)
              errors++
          } else {
              processed++
          }
      }))
      process.stdout.write('.')
  }
  console.log(`\n✅ Proceso completado. Actualizados: ${processed}, Errores: ${errors}`)
}

run().catch(console.error)
