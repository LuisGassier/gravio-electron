/**
 * Backfill Script: Generate historical virtual records for OOSLMP (Dec 1-27, 2024)
 *
 * This script generates synthetic records to fill in missing data for December 2024.
 * It only processes days that had physical activity (real truck records).
 *
 * Usage:
 *   DRY_RUN mode (default, no inserts):
 *     SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node scripts/backfill_ooslmp_december_2024.ts
 *
 *   LIVE mode (actually inserts):
 *     DRY_RUN=false SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node scripts/backfill_ooslmp_december_2024.ts
 */

import { createClient } from '@supabase/supabase-js'

// Configuration from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const CLAVE_EMPRESA = 4 // OOSLMP
const DRY_RUN = process.env.DRY_RUN !== 'false' // Default to dry run for safety

// Targets and constraints
// Monthly target: 2.5-3M kg, for 27 days (Dec 1-27) = ~2.25-2.7M kg
// Working days: 21, so target = 2.25M kg
const TARGET_TOTAL_KG = 2250000 // 2.25M kg total for Dec 1-27
const TARGET_DAILY_MEAN = 10 // Mean daily count: 9-11 records per day
const COLLISION_BUFFER_MINUTES = 8 // Minimum minutes between records

// Date range: December 1-27, 2025
const START_DATE = new Date('2025-12-01T00:00:00-06:00')
const END_DATE = new Date('2025-12-27T23:59:59-06:00')

// Validate environment
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  process.exit(1)
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
})

/**
 * Utility: Sample from truncated normal distribution
 * Used to generate realistic variation in weights and daily counts
 */
function sampleTruncatedNormal(mean: number, std: number, min: number, max: number): number {
  for (let i = 0; i < 100; i++) {
    const u1 = Math.random()
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    const v = mean + z * std
    if (v >= min && v <= max) return v
  }
  // Fallback if no valid sample found
  return Math.max(min, Math.min(max, mean))
}

/**
 * Step 1: Identify working days (days with physical records)
 * Returns array of date strings in YYYY-MM-DD format
 */
async function getWorkingDays(): Promise<string[]> {
  console.log('📅 Identificando días con actividad física...')

  const { data, error } = await supabase
    .from('registros')
    .select('fecha_entrada')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', START_DATE.toISOString())
    .lte('fecha_entrada', END_DATE.toISOString())

  if (error) {
    console.error('❌ Error al consultar registros físicos:', error)
    throw error
  }

  // Extract unique days
  const daysSet = new Set<string>()
  data?.forEach(row => {
    const date = new Date(row.fecha_entrada)
    const dayKey = date.toISOString().split('T')[0] // YYYY-MM-DD
    daysSet.add(dayKey)
  })

  const workingDays = Array.from(daysSet).sort()
  console.log(`✅ Encontrados ${workingDays.length} días con actividad`)

  if (workingDays.length === 0) {
    console.warn('⚠️  No se encontraron días con registros físicos en el rango especificado')
  }

  return workingDays
}

/**
 * Step 2: Get physical records for a specific day
 * Physical records are those WITHOUT the SYSTEM_GENERATED marker
 */
async function getPhysicalRecordsForDay(dayKey: string) {
  const day = new Date(dayKey + 'T00:00:00-06:00')
  const nextDay = new Date(day)
  nextDay.setDate(nextDay.getDate() + 1)

  const { data, error } = await supabase
    .from('registros')
    .select('id, fecha_entrada, registrado_por')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', day.toISOString())
    .lt('fecha_entrada', nextDay.toISOString())

  if (error) {
    console.error(`❌ Error al obtener registros físicos para ${dayKey}:`, error)
    return []
  }

  // Filter out virtual records (those with SYSTEM_GENERATED marker)
  const physicalOnly = (data || []).filter(r =>
    !r.registrado_por || !r.registrado_por.includes('SYSTEM_GENERATED_OOSLMP')
  )

  return physicalOnly
}

/**
 * Step 3: Get existing virtual records for a specific day
 * Virtual records are those WITH the SYSTEM_GENERATED marker in registros table
 */
async function getVirtualRecordsForDay(dayKey: string) {
  const day = new Date(dayKey + 'T00:00:00-06:00')
  const nextDay = new Date(day)
  nextDay.setDate(nextDay.getDate() + 1)

  const { data, error } = await supabase
    .from('registros')
    .select('id, fecha_entrada, registrado_por')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', day.toISOString())
    .lt('fecha_entrada', nextDay.toISOString())

  if (error) {
    console.error(`❌ Error al obtener registros virtuales para ${dayKey}:`, error)
    return []
  }

  // Filter only virtual records (those with SYSTEM_GENERATED marker)
  const virtualOnly = (data || []).filter(r =>
    r.registrado_por && r.registrado_por.includes('SYSTEM_GENERATED_OOSLMP')
  )

  return virtualOnly
}

/**
 * Step 4: Generate valid timestamp avoiding collisions
 * Returns null if unable to find valid timestamp after many attempts
 */
function generateTimestamp(
  dayKey: string,
  existingTimestamps: Date[]
): Date | null {
  const day = new Date(dayKey + 'T00:00:00-06:00')
  const dayOfWeek = day.getDay()

  // Define valid time windows based on day of week
  const windows = dayOfWeek === 0
    ? [{ start: 0, end: 7 }, { start: 16, end: 24 }] // Sunday: 00:00-07:00 and 16:00-23:59
    : [{ start: 7, end: 17 }] // Monday-Saturday: 07:00-17:00

  // Try up to 200 times to find a non-colliding timestamp
  for (let attempt = 0; attempt < 200; attempt++) {
    const window = windows[Math.floor(Math.random() * windows.length)]
    const hour = Math.floor(Math.random() * (window.end - window.start)) + window.start
    const minute = Math.floor(Math.random() * 60)
    const second = Math.floor(Math.random() * 60)

    const candidate = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      hour,
      minute,
      second
    )

    // Check for collisions (8-minute buffer)
    const bufferMs = COLLISION_BUFFER_MINUTES * 60 * 1000
    const hasCollision = existingTimestamps.some(ts =>
      Math.abs(candidate.getTime() - ts.getTime()) < bufferMs
    )

    if (!hasCollision) {
      existingTimestamps.push(candidate) // Add to prevent future collisions
      return candidate
    }
  }

  console.warn(`⚠️  No se pudo generar timestamp sin colisión para ${dayKey} después de 200 intentos`)
  return null
}

/**
 * Step 5: Generate weight using truncated normal distribution
 */
function generateWeight(avgWeight: number): number {
  const mean = Math.max(avgWeight, 500) // Minimum 500 kg
  const std = mean * 0.15 // Standard deviation: 15% of mean
  const min = Math.max(200, mean * 0.5)
  const max = mean * 2

  return Math.round(sampleTruncatedNormal(mean, std, min, max))
}

/**
 * Step 6: Get catalogues (operators, vehicles, routes, concepts)
 */
async function getCatalogues() {
  console.log('📚 Cargando catálogos (operadores, vehículos, rutas, conceptos)...')

  // Query all related entities for CLAVE_EMPRESA
  const [
    { data: vehiculos, error: vehError },
    { data: rutas, error: rutasError },
    { data: operadoresEmpresas, error: opEmpError },
    { data: conceptosEmpresas, error: concEmpError }
  ] = await Promise.all([
    supabase.from('vehiculos').select('*').eq('clave_empresa', CLAVE_EMPRESA),
    supabase.from('rutas').select('*').eq('clave_empresa', CLAVE_EMPRESA),
    supabase.from('operadores_empresas').select('operador_id').eq('clave_empresa', CLAVE_EMPRESA),
    supabase.from('conceptos_empresas').select('concepto_id').eq('clave_empresa', CLAVE_EMPRESA)
  ])

  if (vehError) console.warn('⚠️  Error al cargar vehículos:', vehError)
  if (rutasError) console.warn('⚠️  Error al cargar rutas:', rutasError)
  if (opEmpError) console.warn('⚠️  Error al cargar operadores_empresas:', opEmpError)
  if (concEmpError) console.warn('⚠️  Error al cargar conceptos_empresas:', concEmpError)

  // Get full operator and concept records
  const operadorIds = operadoresEmpresas?.map(oe => oe.operador_id) || []
  const conceptoIds = conceptosEmpresas?.map(ce => ce.concepto_id) || []

  const [
    { data: operadores },
    { data: conceptos }
  ] = await Promise.all([
    operadorIds.length > 0
      ? supabase.from('operadores').select('*').in('id', operadorIds)
      : Promise.resolve({ data: [] }),
    conceptoIds.length > 0
      ? supabase.from('conceptos').select('*').in('id', conceptoIds)
      : Promise.resolve({ data: [] })
  ])

  console.log(`   - Operadores: ${operadores?.length || 0}`)
  console.log(`   - Vehículos: ${vehiculos?.length || 0}`)
  console.log(`   - Rutas: ${rutas?.length || 0}`)
  console.log(`   - Conceptos: ${conceptos?.length || 0}`)

  return {
    operadores: operadores || [],
    vehiculos: vehiculos || [],
    rutas: rutas || [],
    conceptos: conceptos || []
  }
}

/**
 * Utility: Pick random item from array
 */
function pickRandom<T>(arr: T[]): T | null {
  return arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null
}

/**
 * Main backfill function
 */
async function backfill() {
  console.log('🚀 Iniciando backfill de registros virtuales OOSLMP')
  console.log(`📊 Periodo: ${START_DATE.toISOString()} - ${END_DATE.toISOString()}`)
  console.log(`🎯 Target total: ${TARGET_TOTAL_KG.toLocaleString()} kg`)
  console.log(`🔧 Modo: ${DRY_RUN ? 'DRY RUN (no se insertará nada)' : 'LIVE (inserción real)'}`)
  console.log('')

  // Step 1: Get working days
  const workingDays = await getWorkingDays()

  if (workingDays.length === 0) {
    console.log('❌ No se encontraron días con actividad. Finalizando.')
    return
  }

  console.log('')

  // Step 2: Calculate existing waste from physical records
  console.log('🔍 Calculando basura ya tirada en registros físicos...')
  const { data: physicalWaste } = await supabase
    .from('registros')
    .select('peso, peso_entrada, peso_salida')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', START_DATE.toISOString())
    .lte('fecha_entrada', END_DATE.toISOString())

  let existingWasteKg = 0
  physicalWaste?.forEach(r => {
    // Calculate waste as: peso_entrada - peso_salida, or use peso field if available
    const waste = r.peso || (r.peso_entrada && r.peso_salida ? r.peso_entrada - r.peso_salida : 0)
    existingWasteKg += waste || 0
  })

  const remainingKg = Math.max(0, TARGET_TOTAL_KG - existingWasteKg)
  console.log(`   Ya tirados: ${existingWasteKg.toLocaleString()} kg`)
  console.log(`   Faltantes: ${remainingKg.toLocaleString()} kg`)
  console.log('')

  // Step 3: Get catalogues
  const catalogues = await getCatalogues()
  console.log('')

  // Calculate kg per working day (distribute remaining evenly)
  const kgPerDay = remainingKg / workingDays.length
  console.log(`📈 Distribución: ${kgPerDay.toFixed(0)} kg por día trabajado`)
  console.log('')

  const recordsToInsert: any[] = []
  let totalKgGenerated = 0

  // Count total virtual records needed to calculate exact weight per record
  let totalVirtualNeeded = 0
  const dayPlan: { dayKey: string; virtualNeeded: number; physicalCount: number; virtualCount: number }[] = []

  for (const dayKey of workingDays) {
    const physicalRecords = await getPhysicalRecordsForDay(dayKey)
    const virtualRecords = await getVirtualRecordsForDay(dayKey)

    const physicalCount = physicalRecords.length
    const virtualCount = virtualRecords.length

    // Target: 9-11 total records (physical + virtual) per day
    const targetTotal = Math.round(sampleTruncatedNormal(TARGET_DAILY_MEAN, 1, 9, 11))
    const virtualNeeded = Math.max(0, targetTotal - physicalCount - virtualCount)

    if (virtualNeeded > 0) {
      totalVirtualNeeded += virtualNeeded
      dayPlan.push({ dayKey, virtualNeeded, physicalCount, virtualCount })
    }
  }

  // Calculate exact average weight per virtual record to hit target
  const avgWastePerRecord = remainingKg / totalVirtualNeeded
  console.log(`🎯 Peso promedio por registro virtual: ${avgWastePerRecord.toFixed(0)} kg`)
  console.log('')

  // Process each working day
  for (const plan of dayPlan) {
    const { dayKey, virtualNeeded, physicalCount, virtualCount } = plan
    const physicalRecords = await getPhysicalRecordsForDay(dayKey)
    const virtualRecords = await getVirtualRecordsForDay(dayKey)

    // Collect existing timestamps (both physical and virtual)
    const existingTimestamps = [
      ...physicalRecords.map(r => new Date(r.fecha_entrada)),
      ...virtualRecords.map(r => new Date(r.fecha_entrada))
    ]

    // Generate virtual records for this day
    let dayKg = 0
    let generatedCount = 0

    for (let i = 0; i < virtualNeeded; i++) {
      const timestamp = generateTimestamp(dayKey, existingTimestamps)
      if (!timestamp) {
        console.warn(`   ⚠️  No se pudo generar timestamp ${i + 1}/${virtualNeeded} para ${dayKey}`)
        continue
      }

      // Generate peso_salida (empty truck weight) based on real data
      // Real data: min=6,630 kg, max=14,650 kg, avg=8,789 kg, median=6,890 kg
      const pesoSalida = Math.round(sampleTruncatedNormal(8800, 2000, 6600, 14600))

      // Generate waste (difference) centered around calculated average to hit target
      // Use ±20% variation to maintain realistic distribution
      const wasteMin = Math.max(5000, avgWastePerRecord * 0.8) // Minimum 5 tons
      const wasteMax = avgWastePerRecord * 1.2
      const wasteStd = avgWastePerRecord * 0.1 // 10% standard deviation
      const waste = Math.round(sampleTruncatedNormal(avgWastePerRecord, wasteStd, wasteMin, wasteMax))

      // Calculate entrada weight (truck arrives full)
      const pesoEntrada = waste + pesoSalida

      // Generate exit time: 11 minutes ± 4 minutes after entry
      const minutesDiff = Math.round(sampleTruncatedNormal(11, 4, 7, 15))
      const fechaSalida = new Date(timestamp.getTime() + minutesDiff * 60 * 1000)

      // created_at should be ~2-3 seconds before fecha_entrada
      const createdAt = new Date(timestamp.getTime() - (2000 + Math.random() * 1000))

      dayKg += waste // Count the waste (difference) as the actual contribution

      const operador = pickRandom(catalogues.operadores)
      const vehiculo = pickRandom(catalogues.vehiculos)
      const ruta = pickRandom(catalogues.rutas)
      const concepto = pickRandom(catalogues.conceptos)

      recordsToInsert.push({
        clave_empresa: CLAVE_EMPRESA,
        peso_entrada: pesoEntrada,
        peso_salida: pesoSalida,
        peso: waste,
        fecha_entrada: timestamp.toISOString(),
        fecha_salida: fechaSalida.toISOString(),
        tipo_pesaje: 'entrada',
        registrado_por: 'SYSTEM_GENERATED_OOSLMP_BACKFILL',
        operador: operador?.operador || null,
        clave_operador: operador?.clave_operador || null,
        numero_economico: vehiculo?.no_economico || null,
        placa_vehiculo: vehiculo?.placas || 'BACKFILL-VIRTUAL',
        ruta: ruta?.ruta || null,
        clave_ruta: ruta?.clave_ruta || null,
        clave_concepto: concepto?.clave_concepto || null,
        concepto_id: concepto?.id || null,
        folio: null,
        sincronizado: true,
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString()
      })

      generatedCount++
    }

    totalKgGenerated += dayKg
    console.log(`${dayKey}: ${physicalCount} físicos + ${virtualCount} existentes + ${generatedCount} nuevos = ${physicalCount + virtualCount + generatedCount} total (${dayKg.toLocaleString()} kg)`)
  }

  console.log('')
  console.log('═'.repeat(80))
  console.log('📊 RESUMEN DEL BACKFILL')
  console.log('═'.repeat(80))
  console.log(`   Días procesados:              ${workingDays.length}`)
  console.log(`   Registros virtuales a crear:  ${recordsToInsert.length}`)
  console.log(`   Kg totales generados:         ${totalKgGenerated.toLocaleString()} kg`)
  console.log(`   Target objetivo:              ${TARGET_TOTAL_KG.toLocaleString()} kg`)
  console.log(`   Diferencia:                   ${(totalKgGenerated - TARGET_TOTAL_KG).toLocaleString()} kg (${((totalKgGenerated / TARGET_TOTAL_KG - 1) * 100).toFixed(1)}%)`)
  console.log('═'.repeat(80))
  console.log('')

  if (DRY_RUN) {
    console.log('🔍 DRY RUN - No se insertaron registros en la base de datos')
    console.log('   Para ejecutar la inserción real, usar:')
    console.log('   DRY_RUN=false SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node scripts/backfill_ooslmp_december_2024.ts')
    console.log('')
    return
  }

  // Insert records in batches
  console.log('💾 Insertando registros en Supabase (tabla: registros)...')
  const batchSize = 50
  const totalBatches = Math.ceil(recordsToInsert.length / batchSize)

  for (let i = 0; i < recordsToInsert.length; i += batchSize) {
    const batch = recordsToInsert.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1

    const { error } = await supabase.from('registros').insert(batch)

    if (error) {
      console.error(`❌ Error en lote ${batchNum}/${totalBatches}:`, error)
      throw error
    }

    console.log(`   ✅ Lote ${batchNum}/${totalBatches} insertado (${batch.length} registros)`)
  }

  console.log('')
  console.log('═'.repeat(80))
  console.log('✅ BACKFILL COMPLETADO EXITOSAMENTE')
  console.log('═'.repeat(80))
  console.log(`   Total de registros insertados: ${recordsToInsert.length}`)
  console.log(`   Total de kg generados: ${totalKgGenerated.toLocaleString()} kg`)
  console.log('')
}

// Execute backfill
backfill().catch(err => {
  console.error('')
  console.error('═'.repeat(80))
  console.error('❌ ERROR FATAL')
  console.error('═'.repeat(80))
  console.error(err)
  console.error('')
  process.exit(1)
})
