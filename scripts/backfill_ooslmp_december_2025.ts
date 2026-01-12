/**
 * Backfill Script: Generate historical virtual records for OOSLMP (Dec 1-31, 2025)
 *
 * This script:
 * 1. Deletes all existing virtual records for December 2025
 * 2. Generates new synthetic records with realistic business rules
 *
 * Usage:
 *   DRY_RUN mode (default, no changes):
 *     SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node scripts/backfill_ooslmp_december_2025.ts
 *
 *   LIVE mode (actually deletes and inserts):
 *     DRY_RUN=false SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node scripts/backfill_ooslmp_december_2025.ts
 */

import { createClient } from '@supabase/supabase-js'

// Configuration from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const CLAVE_EMPRESA = 4 // OOSLMP
const DRY_RUN = process.env.DRY_RUN !== 'false' // Default to dry run for safety

// Targets and constraints
const TARGET_TOTAL_KG = 2750000 // 2.75 million kg for December 2025
const COLLISION_BUFFER_MINUTES = 15 // Minimum minutes between same truck entries

// Date range: December 1-31, 2025 (México time UTC-6)
// Note: Database stores in UTC, so we need to adjust
const START_DATE = new Date('2025-12-01T00:00:00-06:00') // Dec 1, 2025 00:00 México time
const END_DATE = new Date('2025-12-31T23:59:59-06:00')   // Dec 31, 2025 23:59 México time

// Vehicle types and specifications
type VehicleType = 'CARGA_TRASERA' | 'VOLTEO'

interface VehicleSpec {
  numero_economico: string
  placa: string
  tipo: VehicleType
  peso_salida_min: number // kg (empty truck weight)
  peso_salida_max: number
  capacidad_min: number // kg (waste capacity)
  capacidad_max: number
  viajes_por_dia_min: number
  viajes_por_dia_max: number
}

// 8 vehículos reales de OOSLMP: 4 carga trasera (cunas) + 4 volteo
const VEHICLES: VehicleSpec[] = [
  // 4 Carga Trasera (Cunas) - Higher capacity
  { numero_economico: '2020', placa: 'SN46198', tipo: 'CARGA_TRASERA', peso_salida_min: 13000, peso_salida_max: 14000, capacidad_min: 10000, capacidad_max: 13000, viajes_por_dia_min: 1, viajes_por_dia_max: 2 },
  { numero_economico: '2025', placa: 'SM02293', tipo: 'CARGA_TRASERA', peso_salida_min: 13000, peso_salida_max: 14000, capacidad_min: 10000, capacidad_max: 13000, viajes_por_dia_min: 1, viajes_por_dia_max: 2 },
  { numero_economico: '5', placa: 'SP85739', tipo: 'CARGA_TRASERA', peso_salida_min: 13000, peso_salida_max: 14000, capacidad_min: 10000, capacidad_max: 13000, viajes_por_dia_min: 1, viajes_por_dia_max: 2 },
  { numero_economico: '6', placa: 'SP85738', tipo: 'CARGA_TRASERA', peso_salida_min: 13000, peso_salida_max: 14000, capacidad_min: 10000, capacidad_max: 13000, viajes_por_dia_min: 1, viajes_por_dia_max: 2 },

  // 4 Volteo - Lower capacity
  { numero_economico: '2002', placa: 'SP81281', tipo: 'VOLTEO', peso_salida_min: 3600, peso_salida_max: 6500, capacidad_min: 5000, capacidad_max: 7000, viajes_por_dia_min: 1, viajes_por_dia_max: 2 },
  { numero_economico: '2024', placa: 'SN31022', tipo: 'VOLTEO', peso_salida_min: 3600, peso_salida_max: 6500, capacidad_min: 5000, capacidad_max: 7000, viajes_por_dia_min: 1, viajes_por_dia_max: 2 },
  { numero_economico: '2012', placa: 'SN43220', tipo: 'VOLTEO', peso_salida_min: 3600, peso_salida_max: 6500, capacidad_min: 5000, capacidad_max: 7000, viajes_por_dia_min: 1, viajes_por_dia_max: 2 },
  { numero_economico: '2011', placa: 'SN31025', tipo: 'VOLTEO', peso_salida_min: 3600, peso_salida_max: 6500, capacidad_min: 5000, capacidad_max: 7000, viajes_por_dia_min: 1, viajes_por_dia_max: 2 },
]

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
 */
function sampleTruncatedNormal(mean: number, std: number, min: number, max: number): number {
  for (let i = 0; i < 100; i++) {
    const u1 = Math.random()
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    const v = mean + z * std
    if (v >= min && v <= max) return v
  }
  return Math.max(min, Math.min(max, mean))
}

/**
 * Utility: Round to nearest 10
 * 5+ rounds up, 4- rounds down
 * Examples: 56 -> 60, 54 -> 50, 45 -> 50, 44 -> 40
 */
function roundToNearestTen(value: number): number {
  const ones = value % 10
  const base = value - ones
  return ones >= 5 ? base + 10 : base
}

/**
 * Utility: Pick random item from array
 */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Utility: Get load factor based on day of week
 * Monday, Tuesday, Saturday: More loaded (1.0 - 1.15x)
 * Wednesday, Thursday, Friday: Less loaded (0.85 - 1.0x)
 * Sunday: Variable (0.9 - 1.1x)
 */
function getLoadFactor(dayOfWeek: number): number {
  if (dayOfWeek === 1 || dayOfWeek === 2 || dayOfWeek === 6) {
    // Monday, Tuesday, Saturday - heavier loads
    return sampleTruncatedNormal(1.075, 0.05, 1.0, 1.15)
  } else if (dayOfWeek === 3 || dayOfWeek === 4 || dayOfWeek === 5) {
    // Wednesday, Thursday, Friday - lighter loads
    return sampleTruncatedNormal(0.925, 0.05, 0.85, 1.0)
  } else {
    // Sunday - variable
    return sampleTruncatedNormal(1.0, 0.1, 0.9, 1.1)
  }
}

/**
 * Step 1: Delete all virtual records for December 2025
 */
async function deleteVirtualRecords(): Promise<number> {
  console.log('🗑️  Buscando registros virtuales de diciembre 2025...')

  const { data: virtualRecords, error: fetchError } = await supabase
    .from('registros')
    .select('id, fecha_entrada, registrado_por')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', START_DATE.toISOString())
    .lte('fecha_entrada', END_DATE.toISOString())

  if (fetchError) {
    console.error('❌ Error al buscar registros:', fetchError)
    throw fetchError
  }

  // Filter only virtual records (those with SYSTEM_GENERATED marker)
  const virtualOnly = (virtualRecords || []).filter(r =>
    r.registrado_por && r.registrado_por.includes('SYSTEM_GENERATED_OOSLMP')
  )

  console.log(`   Encontrados ${virtualOnly.length} registros virtuales a borrar`)

  if (virtualOnly.length === 0) {
    console.log('   ✅ No hay registros virtuales que borrar')
    return 0
  }

  if (DRY_RUN) {
    console.log('   🔍 DRY RUN - No se borrarán registros')
    return virtualOnly.length
  }

  // Delete in batches
  const batchSize = 100
  const totalBatches = Math.ceil(virtualOnly.length / batchSize)
  let deleted = 0

  for (let i = 0; i < virtualOnly.length; i += batchSize) {
    const batch = virtualOnly.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1
    const ids = batch.map(r => r.id)

    const { error } = await supabase
      .from('registros')
      .delete()
      .in('id', ids)

    if (error) {
      console.error(`❌ Error borrando lote ${batchNum}/${totalBatches}:`, error)
      throw error
    }

    deleted += batch.length
    console.log(`   ✅ Lote ${batchNum}/${totalBatches} borrado (${batch.length} registros)`)
  }

  console.log(`   ✅ Total borrados: ${deleted} registros`)
  return deleted
}

/**
 * Step 2: Get catalogues (operators, routes, concepts)
 */
async function getCatalogues() {
  console.log('📚 Cargando catálogos...')

  const [
    { data: operadoresEmpresas, error: opEmpError },
    { data: rutas, error: rutasError },
    { data: conceptosEmpresas, error: concEmpError }
  ] = await Promise.all([
    supabase.from('operadores_empresas').select('operador_id').eq('clave_empresa', CLAVE_EMPRESA),
    supabase.from('rutas').select('*').eq('clave_empresa', CLAVE_EMPRESA),
    supabase.from('conceptos_empresas').select('concepto_id').eq('clave_empresa', CLAVE_EMPRESA)
  ])

  if (opEmpError) console.warn('⚠️  Error al cargar operadores_empresas:', opEmpError)
  if (rutasError) console.warn('⚠️  Error al cargar rutas:', rutasError)
  if (concEmpError) console.warn('⚠️  Error al cargar conceptos_empresas:', concEmpError)

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

  // Find or use first operator (should be "OOSLMP")
  const ooslmpOperator = (operadores || []).find(op =>
    op.operador && op.operador.toLowerCase().includes('ooslmp')
  ) || (operadores || [])[0]

  // Find or use route "recolección diferenciada"
  const recoleccionRuta = (rutas || []).find(r =>
    r.ruta && r.ruta.toLowerCase().includes('recolección diferenciada')
  ) || (rutas || [])[0]

  console.log(`   - Operador fijo: ${ooslmpOperator?.operador || 'N/A'}`)
  console.log(`   - Ruta fija: ${recoleccionRuta?.ruta || 'N/A'}`)
  console.log(`   - Conceptos disponibles: ${conceptos?.length || 0}`)
  console.log(`   - Vehículos configurados: ${VEHICLES.length} (${VEHICLES.filter(v => v.tipo === 'CARGA_TRASERA').length} carga trasera/cunas, ${VEHICLES.filter(v => v.tipo === 'VOLTEO').length} volteo)`)

  return {
    operador: ooslmpOperator,
    ruta: recoleccionRuta,
    conceptos: conceptos || []
  }
}

/**
 * Step 3: Get working days (days with physical activity)
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

  // Extract unique days (in México timezone)
  const daysSet = new Set<string>()
  data?.forEach(row => {
    const date = new Date(row.fecha_entrada)
    // Convert to México time (UTC-6)
    const mexicoDate = new Date(date.getTime() - (6 * 60 * 60 * 1000))
    const dayKey = mexicoDate.toISOString().split('T')[0] // YYYY-MM-DD
    daysSet.add(dayKey)
  })

  const workingDays = Array.from(daysSet).sort()
  console.log(`✅ Encontrados ${workingDays.length} días con actividad`)

  if (workingDays.length === 0) {
    console.warn('⚠️  No se encontraron días con registros físicos. Se generarán para todos los días de lunes a sábado.')
    // Generate all Mon-Sat days in December 2025
    const allDays: string[] = []
    const current = new Date(START_DATE)
    while (current <= END_DATE) {
      const dayOfWeek = current.getDay()
      // Skip Sundays (0) for now
      if (dayOfWeek !== 0) {
        const mexicoDate = new Date(current.getTime() - (6 * 60 * 60 * 1000))
        allDays.push(mexicoDate.toISOString().split('T')[0])
      }
      current.setDate(current.getDate() + 1)
    }
    return allDays
  }

  return workingDays
}

/**
 * Step 4: Generate timestamp within working hours
 * Monday-Saturday: 7:30 AM - 3:00 PM
 * Sunday: 4:00 PM - 9:00 PM (if included)
 */
function generateTimestamp(dayKey: string, dayOfWeek: number): Date {
  const [year, month, day] = dayKey.split('-').map(Number)

  let startHour: number, endHour: number

  if (dayOfWeek === 0) {
    // Sunday: 4:00 PM - 9:00 PM
    startHour = 16
    endHour = 21
  } else {
    // Monday-Saturday: 7:30 AM - 3:00 PM
    startHour = 7.5 // 7:30 AM
    endHour = 15 // 3:00 PM
  }

  // Generate random time within window
  const hourRange = endHour - startHour
  const randomHours = Math.random() * hourRange
  const totalHours = startHour + randomHours

  const hour = Math.floor(totalHours)
  const minute = Math.floor((totalHours - hour) * 60)
  const second = Math.floor(Math.random() * 60)

  // Create date in México timezone (UTC-6)
  const mexicoTime = new Date(year, month - 1, day, hour, minute, second)

  // Convert to UTC for database storage
  const utcTime = new Date(mexicoTime.getTime() + (6 * 60 * 60 * 1000))

  return utcTime
}

/**
 * Step 5: Generate records for a single day
 * Optimized to hit monthly target by distributing trips across vehicles
 */
async function generateRecordsForDay(
  dayKey: string,
  catalogues: any,
  targetDailyKg: number
) {
  const [year, month, day] = dayKey.split('-').map(Number)
  const mexicoDate = new Date(year, month - 1, day)
  const dayOfWeek = mexicoDate.getDay()

  const loadFactor = getLoadFactor(dayOfWeek)
  const records: any[] = []
  const usedTimestamps: Date[] = []

  // Determine how many vehicles will work today (6-8 vehicles out of 8 total)
  const numVehiclesWorking = Math.floor(sampleTruncatedNormal(7, 0.5, 6, 8))
  const workingVehicles = [...VEHICLES]
    .sort(() => Math.random() - 0.5)
    .slice(0, numVehiclesWorking)

  let totalKgGenerated = 0
  const vehicleTripCount = new Map<string, number>()

  // Generate trips until we hit the daily target
  while (totalKgGenerated < targetDailyKg && records.length < 20) {
    // Select a vehicle (prefer vehicles with fewer trips)
    const vehicle = workingVehicles.reduce((minVehicle, v) => {
      const minTrips = vehicleTripCount.get(minVehicle.numero_economico) || 0
      const vTrips = vehicleTripCount.get(v.numero_economico) || 0
      return vTrips < minTrips ? v : minVehicle
    })

    const vehicleKey = vehicle.numero_economico
    const currentTrips = vehicleTripCount.get(vehicleKey) || 0

    // Check if vehicle has reached max trips per day
    if (currentTrips >= vehicle.viajes_por_dia_max) {
      // Remove this vehicle from working vehicles
      const index = workingVehicles.findIndex(v => v.numero_economico === vehicleKey)
      if (index >= 0) {
        workingVehicles.splice(index, 1)
      }
      if (workingVehicles.length === 0) break
      continue
    }

    // Generate timestamp (try multiple times to avoid collisions)
    let timestamp: Date | null = null
    for (let attempt = 0; attempt < 50; attempt++) {
      const candidateTimestamp = generateTimestamp(dayKey, dayOfWeek)

      // Check for collision
      const hasCollision = usedTimestamps.some(ts =>
        Math.abs(candidateTimestamp.getTime() - ts.getTime()) < COLLISION_BUFFER_MINUTES * 60 * 1000
      )

      if (!hasCollision) {
        timestamp = candidateTimestamp
        break
      }
    }

    if (!timestamp) {
      // Could not find valid timestamp, stop generating for this day
      break
    }

    // Generate weights based on vehicle type and load factor
    let pesoSalida: number, capacidad: number

    if (vehicle.tipo === 'CARGA_TRASERA') {
      // Carga trasera: peso_salida 13-14 tons, capacidad 10-13 tons
      pesoSalida = sampleTruncatedNormal(
        (vehicle.peso_salida_min + vehicle.peso_salida_max) / 2,
        300,
        vehicle.peso_salida_min,
        vehicle.peso_salida_max
      )
      capacidad = sampleTruncatedNormal(
        (vehicle.capacidad_min + vehicle.capacidad_max) / 2,
        800,
        vehicle.capacidad_min,
        vehicle.capacidad_max
      )
    } else {
      // Volteo: peso_salida 3.6-6.5 tons, capacidad 5-7 tons
      pesoSalida = sampleTruncatedNormal(
        (vehicle.peso_salida_min + vehicle.peso_salida_max) / 2,
        600,
        vehicle.peso_salida_min,
        vehicle.peso_salida_max
      )
      capacidad = sampleTruncatedNormal(
        (vehicle.capacidad_min + vehicle.capacidad_max) / 2,
        500,
        vehicle.capacidad_min,
          vehicle.capacidad_max
      )
    }

    // Apply load factor and round
    capacidad = capacidad * loadFactor
    const waste = roundToNearestTen(capacidad)
    pesoSalida = roundToNearestTen(pesoSalida)
    const pesoEntrada = waste + pesoSalida

    // Generate exit time: 11 minutes ± 4 minutes after entry
    const minutesDiff = Math.round(sampleTruncatedNormal(11, 4, 7, 15))
    const fechaSalida = new Date(timestamp.getTime() + minutesDiff * 60 * 1000)

    // created_at should be ~2-3 seconds before fecha_entrada
    const createdAt = new Date(timestamp.getTime() - (2000 + Math.random() * 1000))

    const concepto = catalogues.conceptos.length > 0 ? pickRandom(catalogues.conceptos) : null

    // Calculate updated_at as 2 seconds after fecha_salida
    const updatedAt = new Date(fechaSalida.getTime() + 2000)

    records.push({
      clave_empresa: CLAVE_EMPRESA,
      peso_entrada: pesoEntrada,
      peso_salida: pesoSalida,
      peso: waste,
      fecha_entrada: timestamp.toISOString(),
      fecha_salida: fechaSalida.toISOString(),
      tipo_pesaje: 'completo',
      registrado_por: 'SYSTEM_GENERATED_OOSLMP_BACKFILL_2025',
      operador: 'Operador del Organismo de Limpia',
      clave_operador: catalogues.operador?.clave_operador || null,
      numero_economico: vehicle.numero_economico,
      placa_vehiculo: vehicle.placa,
      ruta: 'Ruta de recoleccion',
      clave_ruta: catalogues.ruta?.clave_ruta || null,
      clave_concepto: concepto ? (concepto as any).clave_concepto : null,
      concepto_id: concepto ? (concepto as any).id : null,
      folio: null,
      sincronizado: true,
      created_at: createdAt.toISOString(),
      updated_at: updatedAt.toISOString()
    })

    // Update tracking
    usedTimestamps.push(timestamp)
    vehicleTripCount.set(vehicleKey, currentTrips + 1)
    totalKgGenerated += waste
  }

  // Sort records by timestamp
  records.sort((a, b) => new Date(a.fecha_entrada).getTime() - new Date(b.fecha_entrada).getTime())

  return records
}

/**
 * Main backfill function
 */
async function backfill() {
  console.log('🚀 Iniciando backfill de registros virtuales OOSLMP')
  console.log(`📊 Periodo: ${START_DATE.toISOString()} - ${END_DATE.toISOString()}`)
  console.log(`   (México time: Dec 1-31, 2025)`)
  console.log(`🎯 Target total: ${TARGET_TOTAL_KG.toLocaleString()} kg (2,750 toneladas)`)
  console.log(`🔧 Modo: ${DRY_RUN ? 'DRY RUN (no se modificará nada)' : 'LIVE (modificación real)'}`)
  console.log('')

  // Step 1: Delete existing virtual records
  const deletedCount = await deleteVirtualRecords()
  console.log('')

  // Step 2: Get catalogues
  const catalogues = await getCatalogues()
  console.log('')

  // Step 3: Get working days
  const workingDays = await getWorkingDays()
  console.log('')

  if (workingDays.length === 0) {
    console.log('❌ No se encontraron días laborales. Finalizando.')
    return
  }

  // Step 4: Generate records for each working day
  console.log('🏭 Generando registros virtuales...')
  console.log('')

  const allRecords: any[] = []
  let totalKgGenerated = 0

  // Calculate target kg per day (distribute evenly across working days)
  const targetDailyKg = TARGET_TOTAL_KG / workingDays.length

  for (const dayKey of workingDays) {
    const records = await generateRecordsForDay(dayKey, catalogues, targetDailyKg)

    const dayKg = records.reduce((sum, r) => sum + r.peso, 0)
    totalKgGenerated += dayKg
    allRecords.push(...records)

    const [year, month, day] = dayKey.split('-').map(Number)
    const mexicoDate = new Date(year, month - 1, day)
    const dayOfWeek = mexicoDate.toLocaleDateString('es-MX', { weekday: 'long' })

    console.log(`${dayKey} (${dayOfWeek}): ${records.length} registros, ${(dayKg / 1000).toFixed(1)} toneladas`)
  }

  console.log('')
  console.log('═'.repeat(80))
  console.log('📊 RESUMEN DEL BACKFILL')
  console.log('═'.repeat(80))
  console.log(`   Registros virtuales borrados:  ${deletedCount}`)
  console.log(`   Días procesados:               ${workingDays.length}`)
  console.log(`   Registros virtuales a crear:   ${allRecords.length}`)
  console.log(`   Kg totales generados:          ${totalKgGenerated.toLocaleString()} kg (${(totalKgGenerated / 1000).toFixed(1)} toneladas)`)
  console.log(`   Target objetivo:               ${TARGET_TOTAL_KG.toLocaleString()} kg (${(TARGET_TOTAL_KG / 1000).toFixed(1)} toneladas)`)
  console.log(`   Diferencia:                    ${(totalKgGenerated - TARGET_TOTAL_KG).toLocaleString()} kg (${((totalKgGenerated / TARGET_TOTAL_KG - 1) * 100).toFixed(1)}%)`)
  console.log('═'.repeat(80))
  console.log('')

  if (DRY_RUN) {
    console.log('🔍 DRY RUN - No se modificó la base de datos')
    console.log('   Para ejecutar la inserción real, usar:')
    console.log('   DRY_RUN=false SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node scripts/backfill_ooslmp_december_2025.ts')
    console.log('')
    return
  }

  // Insert records in batches
  console.log('💾 Insertando registros en Supabase...')
  const batchSize = 50
  const totalBatches = Math.ceil(allRecords.length / batchSize)

  for (let i = 0; i < allRecords.length; i += batchSize) {
    const batch = allRecords.slice(i, i + batchSize)
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
  console.log(`   Total de registros insertados: ${allRecords.length}`)
  console.log(`   Total de kg generados: ${totalKgGenerated.toLocaleString()} kg (${(totalKgGenerated / 1000).toFixed(1)} toneladas)`)
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
