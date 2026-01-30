/**
 * Backfill Script: Generate historical virtual records for OOSLMP (Jan 1-31, 2026)
 *
 * This script:
 * 1. Deletes all existing virtual records for January 2026
 * 2. Generates new synthetic records with realistic business rules
 *
 * Usage:
 *   DRY_RUN mode (default, no changes):
 *     SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node scripts/backfill_ooslmp_january_2026.ts
 *
 *   LIVE mode (actually deletes and inserts):
 *     DRY_RUN=false SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node scripts/backfill_ooslmp_january_2026.ts
 */

import { createClient } from '@supabase/supabase-js'

// Configuration from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const CLAVE_EMPRESA = 4 // OOSLMP
const DRY_RUN = process.env.DRY_RUN !== 'false' // Default to dry run for safety

// Targets and constraints
const TARGET_TOTAL_KG = 2814440 // 2,814.44 tons for January 2026 (including physical records)
const COLLISION_BUFFER_MINUTES = 15 // Minimum minutes between ANY truck entries
const VEHICLE_COOLDOWN_MINUTES = 300 // 5 hours - minimum time before same truck can return (includes route, collection, unload, return)

// Date range: January 1-31, 2026 (México time UTC-6)
// Note: Database stores in UTC, so we need to adjust
const START_DATE = new Date('2026-01-01T00:00:00-06:00') // Jan 1, 2026 00:00 México time
const END_DATE = new Date('2026-01-31T23:59:59-06:00')   // Jan 31, 2026 23:59 México time

// Vehicle types and specifications
type VehicleType = 'COMPACTADOR_2_EJES' | 'COMPACTADOR_1_EJE' | 'VOLTEO'

interface VehicleSpec {
  numero_economico: string
  placa: string
  tipo: VehicleType
  peso_salida_min: number // kg (empty truck weight)
  peso_salida_max: number
  capacidad_min: number // kg (waste capacity)
  capacidad_max: number
  viajes_por_dia_max: number
}

// 9 vehículos reales según especificación de enero 2026:
// - 2 Compactadores de 2 ejes
// - 3 Compactadores de 1 eje
// - 4 Volteo
const VEHICLES: VehicleSpec[] = [
  // 2 Compactadores de 2 ejes
  { numero_economico: '2017', placa: 'SP85738', tipo: 'COMPACTADOR_2_EJES', peso_salida_min: 13200, peso_salida_max: 15500, capacidad_min: 13000, capacidad_max: 14000, viajes_por_dia_max: 12 },
  { numero_economico: '2018', placa: 'SP85739', tipo: 'COMPACTADOR_2_EJES', peso_salida_min: 13200, peso_salida_max: 15500, capacidad_min: 13000, capacidad_max: 14000, viajes_por_dia_max: 12 },

  // 3 Compactadores de 1 eje
  { numero_economico: '2013', placa: 'SN43215', tipo: 'COMPACTADOR_1_EJE', peso_salida_min: 10200, peso_salida_max: 11700, capacidad_min: 9000, capacidad_max: 10000, viajes_por_dia_max: 12 },
  { numero_economico: '2013-2', placa: 'SN46198', tipo: 'COMPACTADOR_1_EJE', peso_salida_min: 10200, peso_salida_max: 11700, capacidad_min: 9000, capacidad_max: 10000, viajes_por_dia_max: 12 },
  { numero_economico: '2010', placa: 'SM02293', tipo: 'COMPACTADOR_1_EJE', peso_salida_min: 10200, peso_salida_max: 11700, capacidad_min: 9000, capacidad_max: 10000, viajes_por_dia_max: 12 },

  // 4 Volteo
  { numero_economico: '2015', placa: 'SP81281', tipo: 'VOLTEO', peso_salida_min: 6000, peso_salida_max: 7500, capacidad_min: 5500, capacidad_max: 6500, viajes_por_dia_max: 12 },
  { numero_economico: '2012', placa: 'SN31022', tipo: 'VOLTEO', peso_salida_min: 6000, peso_salida_max: 7500, capacidad_min: 5500, capacidad_max: 6500, viajes_por_dia_max: 12 },
  { numero_economico: '2012-2', placa: 'SN31025', tipo: 'VOLTEO', peso_salida_min: 6000, peso_salida_max: 7500, capacidad_min: 5500, capacidad_max: 6500, viajes_por_dia_max: 12 },
  { numero_economico: '2012-3', placa: 'SN43220', tipo: 'VOLTEO', peso_salida_min: 6000, peso_salida_max: 7500, capacidad_min: 5500, capacidad_max: 6500, viajes_por_dia_max: 12 },
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
 * Step 1: Delete all virtual records for January 2026
 */
async function deleteVirtualRecords(): Promise<number> {
  console.log('🗑️  Buscando registros virtuales de enero 2026...')

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
 * Utility: Format folio number (OOSL-0000001)
 */
function formatFolio(numero: number): string {
  return `OOSL-${numero.toString().padStart(7, '0')}`
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

  // Find or use first operator (should be "Operador OOSLMP")
  const ooslmpOperator = (operadores || []).find(op =>
    op.operador && op.operador.toLowerCase().includes('ooslmp')
  ) || (operadores || [])[0]

  // Find or use route "Recolección diferenciada"
  const recoleccionRuta = (rutas || []).find(r =>
    r.ruta && r.ruta.toLowerCase().includes('recolección diferenciada')
  ) || (rutas || [])[0]

  console.log(`   - Operador fijo: Operador OOSLMP`)
  console.log(`   - Ruta fija: Recolección diferenciada`)
  console.log(`   - Conceptos disponibles: ${conceptos?.length || 0}`)
  console.log(`   - Vehículos configurados: ${VEHICLES.length} (${VEHICLES.filter(v => v.tipo === 'COMPACTADOR_2_EJES').length} comp. 2 ejes, ${VEHICLES.filter(v => v.tipo === 'COMPACTADOR_1_EJE').length} comp. 1 eje, ${VEHICLES.filter(v => v.tipo === 'VOLTEO').length} volteo)`)

  return {
    operador: ooslmpOperator,
    ruta: recoleccionRuta,
    conceptos: conceptos || []
  }
}

/**
 * Step 3: Get working days (detect from global activity)
 */
async function getWorkingDays(): Promise<string[]> {
  console.log('📅 Analizando actividad real del relleno para determinar días laborables...')

  const workingDays: string[] = []
  const current = new Date(START_DATE)

  // Create a clean date set
  const daysToCheck: string[] = []
  while (current <= END_DATE) {
     // Adjust for timezone to get partial stamp
     const mexicoDate = new Date(current.getTime() - (6 * 60 * 60 * 1000))
     daysToCheck.push(mexicoDate.toISOString().split('T')[0])
     current.setDate(current.getDate() + 1)
  }

  // Check activity for each day
  for (const dayKey of daysToCheck) {
    const dayStart = new Date(dayKey + 'T00:00:00-06:00')
    const dayEnd = new Date(dayKey + 'T23:59:59-06:00')

    // Check GLOBAL activity (all companies) to detect if landfill was open
    // "not based on company 4 but based on when there were working days for all trucks"
    // Fetch timestamps to analyze hourly distribution
    const { data: records, error } = await supabase
        .from('registros')
        .select('fecha_entrada')
        .gte('fecha_entrada', dayStart.toISOString())
        .lte('fecha_entrada', dayEnd.toISOString())
        .not('registrado_por', 'like', '%SYSTEM%')

    if (error) {
        console.error(`❌ Error verificando actividad para ${dayKey}`, error)
        continue
    }

    // Check Global Activity to determine if the landfill was TRULY open
    // For January 2026, we have 3 shifts:
    // - Morning: 7:30 AM - 3:00 PM
    // - Evening: 6:00 PM - 8:00 PM
    // - Night: 11:00 PM - 1:00 AM (next day)
    // We need SIGNIFICANT activity in these windows, not just a few stragglers
    let morningRecords = 0
    let eveningRecords = 0
    let nightRecords = 0
    let totalRecords = records?.length || 0

    // Check specific hours of activity
    if (records && records.length > 0) {
        for (const r of records) {
            // Convert UTC timestamp to Mexico Time (UTC-6)
            const utcDate = new Date(r.fecha_entrada)
            const mxTime = new Date(utcDate.getTime() - (6 * 3600 * 1000))
            const h = mxTime.getUTCHours()

            // Count records by shift
            if (h >= 7 && h <= 15) {
                morningRecords++
            } else if (h >= 18 && h <= 20) {
                eveningRecords++
            } else if (h >= 23 || h <= 1) {
                nightRecords++
            }
        }
    }

    // Logic to determine if day is valid
    // Require at least 3 records in morning shift OR at least 2 in evening shift
    // (Night shift alone is not enough, as it could be stragglers)
    const hasSignificantActivity = morningRecords >= 3 || eveningRecords >= 2
    const isWorkingDay = hasSignificantActivity

    if (totalRecords === 0) {
         console.log(`   🏖️  Día inhábil detectado (Sin actividad): ${dayKey}`)
    } else if (!isWorkingDay) {
         console.log(`   🌙 Día inhábil detectado (Sin actividad significativa en turnos): ${dayKey} (${totalRecords} registros: ${morningRecords} mañana, ${eveningRecords} tarde, ${nightRecords} noche)`)
    } else {
         // It has significant activity during working shifts, so it's a working day
         workingDays.push(dayKey)
         // console.log(`   ✅ Día laborable: ${dayKey} (${totalRecords} registros: ${morningRecords} mañana, ${eveningRecords} tarde, ${nightRecords} noche)`)
    }
  }

  console.log(`✅ Se generarán registros para los ${workingDays.length} días activos encontrados (de ${daysToCheck.length} posibles)`)
  return workingDays
}

/**
 * Step 3.5: Get physical records for a specific day
 */
async function getPhysicalRecordsForDay(dayKey: string) {
  const day = new Date(dayKey + 'T00:00:00-06:00')
  const nextDay = new Date(day)
  nextDay.setDate(nextDay.getDate() + 1)

  const { data, error } = await supabase
    .from('registros')
    .select('id, fecha_entrada, numero_economico, peso_entrada, peso_salida')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', day.toISOString())
    .lt('fecha_entrada', nextDay.toISOString())
    .not('registrado_por', 'like', '%SYSTEM%') // Exclude generated ones

  if (error) {
    console.error(`❌ Error al obtener registros físicos para ${dayKey}:`, error)
    return []
  }

  // Calculate peso for each record
  return (data || []).map(r => ({
    ...r,
    peso: (parseFloat(r.peso_entrada as any) || 0) - (parseFloat(r.peso_salida as any) || 0)
  }))
}

// Global tracking for constraints across all phases
const GLOBAL_TRACKING = {
  timestamps: [] as Date[], // All entry timestamps (virtual + physical)
  vehicleExits: new Map<string, Date>(), // Last exit time per vehicle
  vehicleDailyTrips: new Map<string, number>(), // Key: "placa-YYYY-MM-DD", Value: count
  vehicleShiftTrips: new Map<string, number>() // Key: "placa-YYYY-MM-DD-shift", Value: count per shift
}

/**
 * Step 4: Generate records for a single day
 * 3-shift system for Mon-Sat:
 * - Shift 1 (Morning): 7:30 AM - 3:00 PM (max 9 trips)
 * - Shift 2 (Evening): 6:00 PM - 8:00 PM (max 2 trips)
 * - Shift 3 (Night): 11:00 PM - 1:00 AM (max 1 trip)
 *
 * Sunday: 4:00 PM - 8:00 PM (max 1 trip)
 */
async function generateRecordsForDay(
  dayKey: string,
  catalogues: any,
  targetDailyKg: number,
  existingPhysicalRecords: any[] = [],
  forceMaxCapacity: boolean = false
) {
  const [year, month, day] = dayKey.split('-').map(Number)
  const mexicoDate = new Date(year, month - 1, day)
  const dayOfWeek = mexicoDate.getDay()

  const loadFactor = getLoadFactor(dayOfWeek)
  const records: any[] = []

  // Register physical records in global tracking if not already
  existingPhysicalRecords.forEach(r => {
      const vid = r.numero_economico || 'UNKNOWN'
      const key = `${vid}-${dayKey}`
      const ts = new Date(r.fecha_entrada)

      if (!GLOBAL_TRACKING.vehicleDailyTrips.has(key)) {
         const count = existingPhysicalRecords.filter(pr => pr.numero_economico === vid).length
         GLOBAL_TRACKING.vehicleDailyTrips.set(key, count)
      }
      GLOBAL_TRACKING.timestamps.push(ts)

      const exit = new Date(ts.getTime() + 15 * 60000)
      const last = GLOBAL_TRACKING.vehicleExits.get(vid)
      if (!last || exit > last) {
        GLOBAL_TRACKING.vehicleExits.set(vid, exit)
      }
  })

  // Determine working vehicles
  let workingVehicles = [...VEHICLES]
  if (!forceMaxCapacity) {
       // Randomly select subset for normal days
       workingVehicles.sort(() => Math.random() - 0.5)
       const numVehiclesWorking = Math.floor(sampleTruncatedNormal(7.5, 0.5, 7, 9))
       workingVehicles = workingVehicles.slice(0, numVehiclesWorking)
  }

  // Always include physicals
  const physicalVehicles = new Set(existingPhysicalRecords.map(r => r.numero_economico).filter(Boolean))
  physicalVehicles.forEach(eco => {
      const v = VEHICLES.find(veh => veh.numero_economico === eco)
      if (v && !workingVehicles.includes(v)) workingVehicles.unshift(v)
  })

  // Define shifts (Mon-Sat vs Sunday)
  type Shift = { name: string; startH: number; endH: number; maxTrips: number }
  let shifts: Shift[] = []

  if (dayOfWeek === 0) {
    // Sunday: Single shift
    shifts = [
      { name: 'domingo', startH: 16.0, endH: 20.0, maxTrips: 1 }
    ]
  } else {
    // Mon-Sat: 3 shifts
    shifts = [
      { name: 'mañana', startH: 7.5, endH: 15.0, maxTrips: 9 },
      { name: 'tarde', startH: 18.0, endH: 20.0, maxTrips: 2 },
      { name: 'noche', startH: 23.0, endH: 25.0, maxTrips: 1 } // 25.0 = 1:00 AM next day
    ]
  }

  let totalKgGenerated = 0
  let attempts = 0
  const maxAttempts = forceMaxCapacity ? 1000 : 300

  while (totalKgGenerated < targetDailyKg && attempts < maxAttempts) {
    if (workingVehicles.length === 0) break

    // Select a shift with available capacity (check GLOBAL shift limits)
    let selectedShift: Shift | null = null
    for (const shift of shifts) {
      const globalShiftKey = `global-${dayKey}-${shift.name}`
      const currentGlobalShiftTrips = GLOBAL_TRACKING.vehicleShiftTrips.get(globalShiftKey) || 0

      // Respect GLOBAL shift limits:
      // Morning (7:30-3pm): MAX 9 trips TOTAL across all vehicles
      // Evening (6-8pm): MAX 2 trips TOTAL across all vehicles
      // Night (11pm-1am): MAX 1 trip TOTAL across all vehicles
      if (currentGlobalShiftTrips < shift.maxTrips) {
        selectedShift = shift
        break
      }
    }

    if (!selectedShift) break // All shifts full

    // Select a vehicle (prefer vehicles with fewer trips)
    const vehicle = workingVehicles.reduce((minVehicle, v) => {
      const minKey = `${minVehicle.numero_economico}-${dayKey}`
      const vKey = `${v.numero_economico}-${dayKey}`
      const minTrips = GLOBAL_TRACKING.vehicleDailyTrips.get(minKey) || 0
      const vTrips = GLOBAL_TRACKING.vehicleDailyTrips.get(vKey) || 0
      return vTrips < minTrips ? v : minVehicle
    })

    const vehicleKey = vehicle.numero_economico
    const dailyTripKey = `${vehicle.numero_economico}-${dayKey}`
    const currentTrips = GLOBAL_TRACKING.vehicleDailyTrips.get(dailyTripKey) || 0

    // Check if vehicle has reached daily max
    if (currentTrips >= vehicle.viajes_por_dia_max) {
      workingVehicles = workingVehicles.filter(v => v.numero_economico !== vehicleKey)
      continue
    }

    // Generate timestamp within shift window
    let timestamp: Date | null = null
    const lastExit = GLOBAL_TRACKING.vehicleExits.get(vehicleKey)

    for (let i = 0; i < 100; i++) {
        let t = selectedShift.startH + Math.random() * (selectedShift.endH - selectedShift.startH)

        // Handle night shift crossing midnight
        let actualDay = day
        let actualMonth = month
        let actualYear = year
        if (t >= 24) {
          t -= 24
          actualDay += 1
          // Handle month/year rollover
          const daysInMonth = new Date(actualYear, actualMonth, 0).getDate()
          if (actualDay > daysInMonth) {
            actualDay = 1
            actualMonth += 1
            if (actualMonth > 12) {
              actualMonth = 1
              actualYear += 1
            }
          }
        }

        const h = Math.floor(t)
        const m = Math.floor((t - h) * 60)
        const isoStr = `${actualYear}-${actualMonth.toString().padStart(2, '0')}-${actualDay.toString().padStart(2, '0')}T${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${Math.floor(Math.random()*59).toString().padStart(2, '0')}-06:00`
        const candidate = new Date(isoStr)

        if (lastExit && candidate < lastExit) continue;

        // Check cooldown for same vehicle (route + collection + return takes ~5 hours)
        if (lastExit && currentTrips >= 1) {
            const diffMin = (candidate.getTime() - lastExit.getTime()) / 60000
            if (diffMin < VEHICLE_COOLDOWN_MINUTES) continue;
        }

        // Check collision with any other entry
        const collision = GLOBAL_TRACKING.timestamps.some(existing =>
            Math.abs(existing.getTime() - candidate.getTime()) < COLLISION_BUFFER_MINUTES * 60000
        )
        if (collision) continue;

        timestamp = candidate
        break;
    }

    if (!timestamp) {
      attempts++
      continue
    }

    // Generate weights based on vehicle type
    const round10 = roundToNearestTen
    let pesoSalida: number, pesoEntrada: number, waste: number

    if (vehicle.tipo === 'COMPACTADOR_2_EJES') {
      const pSalidaRaw = sampleTruncatedNormal(14350, 600, vehicle.peso_salida_min, vehicle.peso_salida_max)
      const residuosRaw = sampleTruncatedNormal(13500, 300, vehicle.capacidad_min, vehicle.capacidad_max)
      pesoSalida = round10(pSalidaRaw)
      waste = round10(residuosRaw * loadFactor)
      if (waste < vehicle.capacidad_min) waste = vehicle.capacidad_min
      if (waste > vehicle.capacidad_max) waste = vehicle.capacidad_max
      pesoEntrada = pesoSalida + waste
    } else if (vehicle.tipo === 'COMPACTADOR_1_EJE') {
      const pSalidaRaw = sampleTruncatedNormal(10950, 400, vehicle.peso_salida_min, vehicle.peso_salida_max)
      const residuosRaw = sampleTruncatedNormal(9500, 300, vehicle.capacidad_min, vehicle.capacidad_max)
      pesoSalida = round10(pSalidaRaw)
      waste = round10(residuosRaw * loadFactor)
      if (waste < vehicle.capacidad_min) waste = vehicle.capacidad_min
      if (waste > vehicle.capacidad_max) waste = vehicle.capacidad_max
      pesoEntrada = pesoSalida + waste
    } else { // VOLTEO
      const pSalidaRaw = sampleTruncatedNormal(6750, 400, vehicle.peso_salida_min, vehicle.peso_salida_max)
      const residuosRaw = sampleTruncatedNormal(6000, 300, vehicle.capacidad_min, vehicle.capacidad_max)
      pesoSalida = round10(pSalidaRaw)
      waste = round10(residuosRaw * loadFactor)
      if (waste < vehicle.capacidad_min) waste = vehicle.capacidad_min
      if (waste > vehicle.capacidad_max) waste = vehicle.capacidad_max
      pesoEntrada = pesoSalida + waste
    }

    // Exit time
    const duration = Math.round(sampleTruncatedNormal(11, 4, 7, 15))
    const fechaSalida = new Date(timestamp.getTime() + duration * 60000)
    const createdAt = new Date(timestamp.getTime() - 2000)
    const updatedAt = new Date(fechaSalida.getTime() + 2000)
    const concepto = catalogues.conceptos.length > 0 ? pickRandom(catalogues.conceptos) : null

    const record = {
      clave_empresa: CLAVE_EMPRESA,
      peso_entrada: pesoEntrada,
      peso_salida: pesoSalida,
      peso: waste,
      fecha_entrada: timestamp.toISOString(),
      fecha_salida: fechaSalida.toISOString(),
      tipo_pesaje: 'completo',
      registrado_por: 'SYSTEM_GENERATED_OOSLMP_BACKFILL_2026',
      operador: 'Operador OOSLMP',
      clave_operador: catalogues.operador?.clave_operador || null,
      numero_economico: vehicle.numero_economico,
      placa_vehiculo: vehicle.placa,
      ruta: 'Recolección diferenciada',
      clave_ruta: catalogues.ruta?.clave_ruta || null,
      clave_concepto: concepto ? (concepto as any).clave_concepto : null,
      concepto_id: concepto ? (concepto as any).id : null,
      folio: null,
      sincronizado: true,
      created_at: createdAt.toISOString(),
      updated_at: updatedAt.toISOString()
    }

    records.push(record)

    // Update global tracking
    GLOBAL_TRACKING.timestamps.push(timestamp)
    GLOBAL_TRACKING.vehicleExits.set(vehicleKey, fechaSalida)
    GLOBAL_TRACKING.vehicleDailyTrips.set(dailyTripKey, currentTrips + 1)

    const shiftKey = `global-${dayKey}-${selectedShift.name}`
    const currentShiftTrips = GLOBAL_TRACKING.vehicleShiftTrips.get(shiftKey) || 0
    GLOBAL_TRACKING.vehicleShiftTrips.set(shiftKey, currentShiftTrips + 1)

    totalKgGenerated += waste
    attempts = 0
  }

  // Sort local records (Global will be sorted at end)
  records.sort((a, b) => new Date(a.fecha_entrada).getTime() - new Date(b.fecha_entrada).getTime())
  return records
}

/**
 * Main backfill function
 */
async function backfill() {
  console.log('🚀 Iniciando backfill de registros virtuales OOSLMP')
  console.log(`📊 Periodo: ${START_DATE.toISOString()} - ${END_DATE.toISOString()}`)
  console.log(`   (México time: Jan 1-31, 2026)`)
  console.log(`🎯 Target total: ${TARGET_TOTAL_KG.toLocaleString()} kg (${(TARGET_TOTAL_KG / 1000).toFixed(2)} toneladas)`)
  console.log(`🔧 Modo: ${DRY_RUN ? 'DRY RUN (no se modificará nada)' : 'LIVE (modificación real)'}`)
  console.log('')

  // Step 1: Delete existing virtual records
  const deletedCount = await deleteVirtualRecords()
  console.log('')

  // Step 2: Get catalogues
  const catalogues = await getCatalogues()
  console.log('')

  // Step 3: Get maximum folio number from existing records
  console.log('🔢 Obteniendo último folio usado...')
  const { data: maxFolioData, error: maxFolioError } = await supabase
    .from('registros')
    .select('folio')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .not('folio', 'is', null)
    .order('folio', { ascending: false })
    .limit(1)

  if (maxFolioError) {
    console.error('❌ Error al obtener máximo folio:', maxFolioError)
    throw maxFolioError
  }

  let nextFolioNumber = 1
  if (maxFolioData && maxFolioData.length > 0) {
    const maxFolio = maxFolioData[0].folio
    // Extract number from format OOSL-0000123
    const match = maxFolio.match(/OOSL-(\d+)/)
    if (match) {
      nextFolioNumber = parseInt(match[1], 10) + 1
    }
  }
  console.log(`   Próximo folio a usar: ${formatFolio(nextFolioNumber)}`)
  console.log('')

  // Step 4: Calculate physical records weight in January 2026
  console.log('📊 Calculando peso de registros físicos en enero 2026...')
  const { data: physicalRecords, error: physicalError } = await supabase
    .from('registros')
    .select('peso_entrada, peso_salida')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', START_DATE.toISOString())
    .lte('fecha_entrada', END_DATE.toISOString())
    .not('registrado_por', 'like', '%SYSTEM_GENERATED%')

  if (physicalError) {
    console.error('❌ Error al obtener registros físicos:', physicalError)
    throw physicalError
  }

  // Calculate peso as peso_entrada - peso_salida for each record
  const physicalKg = (physicalRecords || []).reduce((sum, r) => {
    const pesoEntrada = parseFloat(r.peso_entrada as any) || 0
    const pesoSalida = parseFloat(r.peso_salida as any) || 0
    const peso = pesoEntrada - pesoSalida
    return sum + peso
  }, 0)
  const physicalTons = physicalKg / 1000

  console.log(`   Registros físicos encontrados: ${physicalRecords?.length || 0}`)
  console.log(`   Peso físico total: ${physicalKg.toLocaleString()} kg (${physicalTons.toFixed(2)} toneladas)`)

  // Calculate remaining target for virtual records
  const remainingTargetKg = TARGET_TOTAL_KG - physicalKg

  if (remainingTargetKg <= 0) {
    console.log(`   ⚠️  Los registros físicos ya superan el objetivo de ${(TARGET_TOTAL_KG / 1000).toFixed(2)} toneladas`)
    console.log(`   No se generarán registros virtuales.`)
    return
  }

  console.log(`   Target restante para virtuales: ${remainingTargetKg.toLocaleString()} kg (${(remainingTargetKg / 1000).toFixed(2)} toneladas)`)
  console.log('')

  // Step 5: Get working days
  const workingDays = await getWorkingDays()
  console.log('')

  if (workingDays.length === 0) {
    console.log('❌ No se encontraron días laborales. Finalizando.')
    return
  }

  // Step 6: Generate records for each working day
  console.log('🏭 Generando registros virtuales...')
  console.log('')

  const allRecords: any[] = []
  let totalKgGenerated = 0
  let currentFolioNumber = nextFolioNumber

  // Calculate target kg per day
  let sundaysCount = 0
  let weekDaysCount = 0

  workingDays.forEach(day => {
    const d = new Date(day + 'T12:00:00')
    if (d.getDay() === 0) sundaysCount++
    else weekDaysCount++
  })

  const sundayTarget = 10000 // ~1 trip of 10 tons
  const totalSundayTarget = sundaysCount * sundayTarget
  const remainingForWeekDays = remainingTargetKg - totalSundayTarget
  const weekDayTarget = remainingForWeekDays / weekDaysCount

  console.log(`📉 Plan de distribución (Sistema de 3 turnos):`)
  console.log(`   Domingos (${sundaysCount}): ~${(sundayTarget/1000).toFixed(1)} ton/día (Max 1 viaje)`)
  console.log(`   Lun-Sab  (${weekDaysCount}): ~${(weekDayTarget/1000).toFixed(1)} ton/día (Max 12 viajes)`)
  console.log(`   Lunes/Martes/Sábado: Camiones más cargados (factor 1.0-1.15)`)
  console.log(`   Mié/Jue/Vie: Camiones menos cargados (factor 0.85-1.0)`)
  console.log(`   Turnos: Mañana (7:30-3pm, 9 viajes), Tarde (6-8pm, 2 viajes), Noche (11pm-1am, 1 viaje)`)
  console.log('')

  for (const dayKey of workingDays) {
    const d = new Date(dayKey + 'T12:00:00')
    const isSunday = d.getDay() === 0
    const target = isSunday ? sundayTarget : weekDayTarget

    // Get physical records for this day to respect constraints
    const physicalRecordsOfDay = await getPhysicalRecordsForDay(dayKey)
    const physicalKgDay = physicalRecordsOfDay.reduce((sum, r) => sum + (Number(r.peso)||0), 0)

    // Adjust target: If physical already covers part of target, reduce.
    // Add small buffer (5%) to ensure we exceed slightly and can adjust down later
    const remainingForDay = Math.max(0, (target - physicalKgDay) * 1.05)

    const records = await generateRecordsForDay(
        dayKey,
        catalogues,
        remainingForDay,
        physicalRecordsOfDay
    )

    records.forEach(record => {
      record.folio = formatFolio(currentFolioNumber)
      currentFolioNumber++
    })

    const dayKg = records.reduce((sum, r) => sum + r.peso, 0)
    totalKgGenerated += dayKg
    allRecords.push(...records)

    const [year, month, day] = dayKey.split('-').map(Number)
    const mexicoDate = new Date(year, month - 1, day)
    const dayOfWeek = mexicoDate.toLocaleDateString('es-MX', { weekday: 'long' })

    console.log(`${dayKey} (${dayOfWeek}): ${physicalRecordsOfDay.length} físicos (${(physicalKgDay/1000).toFixed(1)}t) + ${records.length} virtuales (${(dayKg / 1000).toFixed(1)}t)`)
  }

  // Step 7: Adjust to hit target exactly
  console.log('')
  console.log('🎯 Ajustando para alcanzar objetivo exacto...')

  let totalJanuaryKg = physicalKg + totalKgGenerated
  let adjustedRecords = [...allRecords]

  // IF SHORT: Add extra records
  if (totalJanuaryKg < TARGET_TOTAL_KG) {
      const missingKg = TARGET_TOTAL_KG - totalJanuaryKg
      console.log(`   Faltante: ${missingKg.toLocaleString()} kg - Generando registros extra...`)

      let addedKg = 0
      let maxLoops = 5000

      const validDayKeys = [...workingDays]

      while (addedKg < missingKg && maxLoops > 0) {
          const randomDay = pickRandom(validDayKeys)

          const records = await generateRecordsForDay(
             randomDay,
             catalogues,
             1, // Target small, forces 1 trip
             [],
             true // forceMaxCapacity
          )

          if (records.length > 0) {
              const r = records[0]
              adjustedRecords.push(r)
              addedKg += r.peso
          }
          maxLoops--
      }

      totalKgGenerated = adjustedRecords.reduce((sum, r) => sum + r.peso, 0)
      totalJanuaryKg = physicalKg + totalKgGenerated
      console.log(`   Finalizado relleno. Nuevo total: ${totalJanuaryKg.toLocaleString()} kg`)
  }

  // If over target, remove records
  const minRecordWeight = 5000

  if (totalJanuaryKg > (TARGET_TOTAL_KG + minRecordWeight)) {
    const excessKg = totalJanuaryKg - TARGET_TOTAL_KG
    console.log(`   Exceso grande: ${excessKg.toLocaleString()} kg - Removiendo registros...`)

    adjustedRecords.sort((a, b) => a.peso - b.peso)

    let removedKg = 0
    let recordsToRemove = 0

    for (let i = 0; i < adjustedRecords.length; i++) {
        const remainingExcess = (excessKg - removedKg)
        if (remainingExcess < adjustedRecords[i].peso) break

        removedKg += adjustedRecords[i].peso
        recordsToRemove++
    }

    adjustedRecords = adjustedRecords.slice(recordsToRemove)
    totalKgGenerated = adjustedRecords.reduce((sum, r) => sum + r.peso, 0)
    totalJanuaryKg = physicalKg + totalKgGenerated

    console.log(`   Registros removidos: ${recordsToRemove}`)
    console.log(`   Peso removido: ${removedKg.toLocaleString()} kg`)
  }

  // FINE TUNING STEP
  let diff = TARGET_TOTAL_KG - totalJanuaryKg

  if (Math.abs(diff) > 0) {
      console.log(`   🔧 Ajuste fino requerido: ${diff > 0 ? '+' : ''}${diff.toLocaleString()} kg`)

      diff = Math.round(diff / 10) * 10

      if (diff !== 0) {
          const step = diff > 0 ? 10 : -10
          let pending = diff
          let loops = 0

          while (pending !== 0 && loops < 500000) {
              const idx = Math.floor(Math.random() * adjustedRecords.length)
              const r = adjustedRecords[idx]

              const newWaste = r.peso + step
              const newEntrada = r.peso_entrada + step

              let isValid = false
              const vehicleInfo = VEHICLES.find(v => v.numero_economico === r.numero_economico)

              if (vehicleInfo) {
                  if (newWaste >= vehicleInfo.capacidad_min && newWaste <= vehicleInfo.capacidad_max) {
                      isValid = true
                  }
              } else {
                  if (newWaste >= 5000 && newWaste <= 14000) isValid = true
              }

              if (isValid) {
                  r.peso = newWaste
                  r.peso_entrada = newEntrada
                  pending -= step
              }
              loops++
          }

          console.log(`   Ajuste fino aplicado. Pendiente: ${pending} kg`)
      }
  }

  // Re-sort chronological
  adjustedRecords.sort((a, b) => new Date(a.fecha_entrada).getTime() - new Date(b.fecha_entrada).getTime())

  // Final re-folio
  let folioNum = nextFolioNumber
  adjustedRecords.forEach(record => {
    record.folio = formatFolio(folioNum)
    folioNum++
  })

  totalKgGenerated = adjustedRecords.reduce((sum, r) => sum + r.peso, 0)
  totalJanuaryKg = physicalKg + totalKgGenerated

  console.log('')
  console.log('═'.repeat(80))
  console.log('📊 RESUMEN DEL BACKFILL')
  console.log('═'.repeat(80))
  console.log(`   Registros virtuales borrados:       ${deletedCount}`)
  console.log(`   Registros físicos en enero:         ${physicalRecords?.length || 0} (${physicalTons.toFixed(2)} toneladas)`)
  console.log(`   Días procesados:                    ${workingDays.length}`)
  console.log(`   Registros virtuales a crear:        ${adjustedRecords.length}`)
  console.log(`   Kg virtuales generados:             ${totalKgGenerated.toLocaleString()} kg (${(totalKgGenerated / 1000).toFixed(2)} toneladas)`)
  console.log(`   ` + '─'.repeat(78))
  console.log(`   TOTAL ENERO 2026:                   ${totalJanuaryKg.toLocaleString()} kg (${(totalJanuaryKg / 1000).toFixed(2)} toneladas)`)
  console.log(`   Target objetivo:                    ${TARGET_TOTAL_KG.toLocaleString()} kg (${(TARGET_TOTAL_KG / 1000).toFixed(2)} toneladas)`)
  console.log(`   Diferencia:                         ${(totalJanuaryKg - TARGET_TOTAL_KG).toLocaleString()} kg (${((totalJanuaryKg / TARGET_TOTAL_KG - 1) * 100).toFixed(1)}%)`)
  console.log('═'.repeat(80))
  console.log('')

  allRecords.length = 0
  allRecords.push(...adjustedRecords)

  if (DRY_RUN) {
    console.log('🔍 DRY RUN - No se modificó la base de datos')
    console.log('   Para ejecutar la inserción real, usar:')
    console.log('   DRY_RUN=false SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node scripts/backfill_ooslmp_january_2026.ts')
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
  console.log(`   Registros virtuales insertados:     ${allRecords.length} (${(totalKgGenerated / 1000).toFixed(2)} toneladas)`)
  console.log(`   Registros físicos existentes:       ${physicalRecords?.length || 0} (${physicalTons.toFixed(2)} toneladas)`)
  console.log(`   ` + '─'.repeat(78))
  console.log(`   TOTAL ENERO 2026:                   ${(physicalRecords?.length || 0) + allRecords.length} registros`)
  console.log(`   TOTAL PESO ENERO 2026:              ${totalJanuaryKg.toLocaleString()} kg (${(totalJanuaryKg / 1000).toFixed(2)} toneladas)`)
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
