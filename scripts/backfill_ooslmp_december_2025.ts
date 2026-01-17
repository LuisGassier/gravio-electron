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
const TARGET_TOTAL_KG = 2751370 // 2,751.37 tons for December 2025 (including physical records)
const COLLISION_BUFFER_MINUTES = 15 // Minimum minutes between ANY truck entries
const MORNING_SHIFT_COOLDOWN = 180 // 3 hours - time before same truck can return (morning to afternoon)
const DRIVER_COOLDOWN_MINUTES = 120 // Minimum minutes before driver switches trucks

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

// 9 vehículos reales: 5 Carga Trasera + 4 Volteo (según especificación exacta)
const VEHICLES: VehicleSpec[] = [
  // 5 Carga Trasera (Compactadores)
  { numero_economico: '2020', placa: 'SN46198', tipo: 'CARGA_TRASERA', peso_salida_min: 13000, peso_salida_max: 14000, capacidad_min: 10000, capacidad_max: 13000, viajes_por_dia_min: 1, viajes_por_dia_max: 2 },
  { numero_economico: '2025', placa: 'SM02293', tipo: 'CARGA_TRASERA', peso_salida_min: 13000, peso_salida_max: 14000, capacidad_min: 10000, capacidad_max: 13000, viajes_por_dia_min: 1, viajes_por_dia_max: 2 },
  { numero_economico: '5', placa: 'SP85739', tipo: 'CARGA_TRASERA', peso_salida_min: 13000, peso_salida_max: 14000, capacidad_min: 10000, capacidad_max: 13000, viajes_por_dia_min: 1, viajes_por_dia_max: 2 },
  { numero_economico: '6', placa: 'SP85738', tipo: 'CARGA_TRASERA', peso_salida_min: 13000, peso_salida_max: 14000, capacidad_min: 10000, capacidad_max: 13000, viajes_por_dia_min: 1, viajes_por_dia_max: 2 },
  // Asumimos este como el 5to compactador ya que los volteos están definidos explícitamente y este sobraba
  { numero_economico: '2012-2', placa: 'SN43221', tipo: 'CARGA_TRASERA', peso_salida_min: 13000, peso_salida_max: 14000, capacidad_min: 10000, capacidad_max: 13000, viajes_por_dia_min: 1, viajes_por_dia_max: 2 },

  // 4 Volteo - Especificados explícitamente
  { numero_economico: '2015', placa: 'SP81281', tipo: 'VOLTEO', peso_salida_min: 3600, peso_salida_max: 6500, capacidad_min: 5000, capacidad_max: 7000, viajes_por_dia_min: 1, viajes_por_dia_max: 2 },
  { numero_economico: '2012', placa: 'SN31022', tipo: 'VOLTEO', peso_salida_min: 3600, peso_salida_max: 6500, capacidad_min: 5000, capacidad_max: 7000, viajes_por_dia_min: 1, viajes_por_dia_max: 2 }, // Usuario dijo 2012 SN31022
  { numero_economico: '2012-3', placa: 'SN43220', tipo: 'VOLTEO', peso_salida_min: 3600, peso_salida_max: 6500, capacidad_min: 5000, capacidad_max: 7000, viajes_por_dia_min: 1, viajes_por_dia_max: 2 },
  { numero_economico: '2012-4', placa: 'SN31025', tipo: 'VOLTEO', peso_salida_min: 3600, peso_salida_max: 6500, capacidad_min: 5000, capacidad_max: 7000, viajes_por_dia_min: 1, viajes_por_dia_max: 2 },
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
  console.log(`   - Vehículos configurados: ${VEHICLES.length} (${VEHICLES.filter(v => v.tipo === 'CARGA_TRASERA').length} carga trasera/cunas, ${VEHICLES.filter(v => v.tipo === 'VOLTEO').length} volteo)`)

  return {
    operador: ooslmpOperator,
    ruta: recoleccionRuta,
    conceptos: conceptos || []
  }
}

/**
 * Step 3: Get working days (ALL days in December 2025)
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

    const count = records?.length || 0

    // Exclude specific holidays manually if strict business rule
    // User requested exclusion of Dec 25 and Dec 31 specifically
    if (dayKey.endsWith('-12-12') || dayKey.endsWith('-12-25') || dayKey.endsWith('-12-31')) { 
         console.log(`   🏖️  Día feriado excluido manualmente: ${dayKey}`)
         continue
    }

    // Check Global Activity to determine if the landfill was TRULY open
    // We filter out days where activity was only in the "madrugada" (early morning) or late night
    // Defined Working Hours for Validation: 07:00 to 20:00 (7 AM - 8 PM)
    // If all records fall outside this window, we assume the landfill wasn't operating normally
    let dayTimeRecords = 0
    let totalRecords = records?.length || 0
    
    // Check specific hours of activity
    if (records && records.length > 0) {
        for (const r of records) {
            // Convert UTC timestamp to Mexico Time (UTC-6)
            const utcDate = new Date(r.fecha_entrada)
            const mxTime = new Date(utcDate.getTime() - (6 * 3600 * 1000))
            const h = mxTime.getUTCHours()

            // Count records in standard operation window (07:00 - 20:00)
            if (h >= 7 && h <= 20) {
                dayTimeRecords++
            }
        }
    }

    // Logic to determine if day is valid
    // We used to require >= 5, but to be safe for days with low volume (like Dec 1-5 potentially),
    // we just ensure there is AT LEAST ONE record during operational hours.
    const isWorkingDay = dayTimeRecords > 0

    if (totalRecords === 0) {
         console.log(`   🏖️  Día inhábil detectado (Sin actividad): ${dayKey}`)
    } else if (!isWorkingDay) {
         console.log(`   🌙 Día inhábil detectado (Solo actividad fuera de horario 07:00-20:00): ${dayKey} (${totalRecords} registros total)`)
    } else {
         // It has significant daytime records, so it's a working day
         workingDays.push(dayKey)
         // console.log(`   ✅ Día laborable: ${dayKey} (${totalRecords} registros, ${dayTimeRecords} en horario diurno)`)
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
    .select('id, fecha_entrada, numero_economico, peso')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', day.toISOString())
    .lt('fecha_entrada', nextDay.toISOString())
    .not('registrado_por', 'like', '%SYSTEM%') // Exclude generated ones

  if (error) {
    console.error(`❌ Error al obtener registros físicos para ${dayKey}:`, error)
    return []
  }

  return data || []
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
    // Monday-Saturday: 7:30 AM - 3:00 PM (Updated per request)
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

// Global tracking for constraints across all phases
const GLOBAL_TRACKING = {
  timestamps: [] as Date[], // All entry timestamps (virtual + physical)
  vehicleExits: new Map<string, Date>(), // Last exit time per vehicle
  vehicleDailyTrips: new Map<string, number>() // Key: "placa-YYYY-MM-DD", Value: count
} // Added global tracking
  
/**
 * Step 5: Generate records for a single day
 * Optimized to hit monthly target by distributing trips across vehicles
 */
async function generateRecordsForDay(
  dayKey: string,
  catalogues: any,
  targetDailyKg: number,
  maxRecordsLimit: number = 20,
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

  let totalKgGenerated = 0
  let attempts = 0
  
  const effectiveLimit = forceMaxCapacity ? 999 : maxRecordsLimit

  while (totalKgGenerated < targetDailyKg && attempts < 300 && (records.length + existingPhysicalRecords.length) < effectiveLimit) {
    if (workingVehicles.length === 0) break

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

    // Trip Max Logic
    let maxTrips = vehicle.viajes_por_dia_max
    if (!forceMaxCapacity) {
        if (dayOfWeek === 0) {
             maxTrips = 3 // Sunday limited
        } else {
             // Normal day: 2 trips for Carga Trasera, 4 for Volteo usually
             // But we want to simulate the "2 Shift" pattern mostly
             if (vehicle.tipo === 'CARGA_TRASERA') maxTrips = 2
             else maxTrips = 3
        }
    }
    
    // Safety check against vehicles config
    maxTrips = Math.min(maxTrips, vehicle.viajes_por_dia_max)

    if (currentTrips >= maxTrips) {
      workingVehicles = workingVehicles.filter(v => v.numero_economico !== vehicleKey)
      continue
    }

    // Schedule: 
    // If strict force, just find ANY slot 7:00-18:00
    // If normal, follow shifts.
    
    let startH = 7.5, endH = 15.0
    if (dayOfWeek === 0) { startH = 16.0; endH = 21.0 }

    let shiftStartH = startH, shiftEndH = endH
    
    if (!forceMaxCapacity) {
        // TWO-SHIFT STRATEGY logic
        if (dayOfWeek !== 0 && currentTrips === 0) {
            shiftStartH = 7.5; shiftEndH = 11.5
        } else if (dayOfWeek !== 0 && currentTrips === 1) {
            shiftStartH = 11.5; shiftEndH = 15.0
        }
    } else {
        // Force mode: Use wider window 6:00 - 18:00 to fit trips
         shiftStartH = 6.0; shiftEndH = 18.0
         if (dayOfWeek === 0) { shiftStartH = 14.0; shiftEndH = 22.0 }
    }

    let timestamp: Date | null = null
    const lastExit = GLOBAL_TRACKING.vehicleExits.get(vehicleKey)

    for (let i = 0; i < 100; i++) {
        const t = shiftStartH + Math.random() * (shiftEndH - shiftStartH)
        const h = Math.floor(t)
        const m = Math.floor((t - h) * 60)
        const isoStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${Math.floor(Math.random()*59).toString().padStart(2, '0')}-06:00`
        const candidate = new Date(isoStr)

        if (lastExit && candidate < lastExit) continue;
        
        if (lastExit && currentTrips >= 1 && !forceMaxCapacity) {
            const diffMin = (candidate.getTime() - lastExit.getTime()) / 60000
            if (diffMin < MORNING_SHIFT_COOLDOWN) continue;
        }

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

    // Generate weights (Same logic as before)
    const round10 = roundToNearestTen
    let pesoSalida: number, pesoEntrada: number, waste: number

    if (vehicle.tipo === 'CARGA_TRASERA') {
      const pSalidaRaw = sampleTruncatedNormal(13500, 300, 13000, 14000)
      const pEntradaRaw = sampleTruncatedNormal(25500, 800, 24000, 27000)
      pesoSalida = round10(pSalidaRaw)
      pesoEntrada = round10(pEntradaRaw)
      waste = pesoEntrada - pesoSalida
      if (waste < 10000) { pesoEntrada += (10000 - waste); waste = pesoEntrada - pesoSalida; }
      if (waste > 14000) { pesoEntrada -= (waste - 13000); waste = pesoEntrada - pesoSalida; }
    } else {
      const pSalidaRaw = sampleTruncatedNormal(5050, 800, 3600, 6500)
      const residuosRaw = sampleTruncatedNormal(6000, 500, 5000, 7000)
      pesoSalida = round10(pSalidaRaw)
      waste = round10(residuosRaw * loadFactor)
      if (waste < 5000) waste = 5000
      if (waste > 7000) waste = 7000
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
      registrado_por: 'SYSTEM_GENERATED_OOSLMP_BACKFILL_2025',
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

  // Step 4: Calculate physical records weight in December 2025
  console.log('📊 Calculando peso de registros físicos en diciembre 2025...')
  const { data: physicalRecords, error: physicalError } = await supabase
    .from('registros')
    .select('peso')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', START_DATE.toISOString())
    .lte('fecha_entrada', END_DATE.toISOString())
    .not('registrado_por', 'like', '%SYSTEM_GENERATED%')

  if (physicalError) {
    console.error('❌ Error al obtener registros físicos:', physicalError)
    throw physicalError
  }

  const physicalKg = (physicalRecords || []).reduce((sum, r) => sum + (parseFloat(r.peso) || 0), 0)
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

  // Calculate target kg per day (distribute weighted: Sundays have less load)
  // Sundays: ~20 tons (approx 2 trips)
  // Mon-Sat: Distribute the rest evenly
  
  let sundaysCount = 0
  let weekDaysCount = 0
  
  workingDays.forEach(day => {
    const d = new Date(day + 'T12:00:00') // Avoid timezone shift issues for day of week check
    if (d.getDay() === 0) sundaysCount++
    else weekDaysCount++
  })
  
  const sundayTarget = 22000 // ~2 trips of 11 tons
  const totalSundayTarget = sundaysCount * sundayTarget
  const remainingForWeekDays = remainingTargetKg - totalSundayTarget
  const weekDayTarget = remainingForWeekDays / weekDaysCount
  
  console.log(`📉 Plan de distribución (Sistema de 2 turnos):`)
  console.log(`   Domingos (${sundaysCount}): ~${(sundayTarget/1000).toFixed(1)} ton/día (Max 2-3 viajes)`)
  console.log(`   Lun-Sab  (${weekDaysCount}): ~${(weekDayTarget/1000).toFixed(1)} ton/día`)
  console.log(`   Lunes/Martes/Sábado: Camiones más cargados (factor 1.0-1.15)`)
  console.log(`   Mié/Jue/Vie: Camiones menos cargados (factor 0.85-1.0)`)
  console.log(`   Estrategia: Turnos mañana (7:30-11:30) y tarde (11:30-3:00)`)
  console.log('')

  for (const dayKey of workingDays) {
    const d = new Date(dayKey + 'T12:00:00')
    const isSunday = d.getDay() === 0
    const target = isSunday ? sundayTarget : weekDayTarget
    
    // Pass explicit trip limit for Sundays
    const maxTripsDay = isSunday ? 2 : 20 

    // Get physical records for this day to respect constraints
    const physicalRecordsOfDay = await getPhysicalRecordsForDay(dayKey)
    const physicalKgDay = physicalRecordsOfDay.reduce((sum, r) => sum + (Number(r.peso)||0), 0)

    // Adjust target: If physical already covers part of target, reduce.
    // Add small buffer (5%) to ensure we exceed slightly and can adjust down later
    const remainingForDay = Math.max(0, (target - physicalKgDay) * 1.05)

    const records = await generateRecordsForDay(
        dayKey, 
        catalogues, 
        remainingForDay, // Use adjusted target
        maxTripsDay,
        physicalRecordsOfDay // Pass physical records
    )
    
    // Assign folios to records in chronological order
    // NOTE: Generating folios sequentially for virtuals is fine, BUT 
    // real physical records might strictly break sequence if we don't interleave.
    // The user asked for consecutive folios for the result.
    // Since we can't change physical folios easily (maybe?), we just ensure virtuals are consecutive AMONG THEMSELVES or 
    // consecutive relative to all? 
    // "Folio: OOSL-0000001 a ..." suggests re-numbering ALL.
    // But physical records usually have their own generated on entry.
    // User said "Renumeré todos los folios consecutivamente".
    // This implies we might need to update physical folios too?
    // Let's stick to assigning new folios to virtuals for now.
    
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

  let totalDecemberKg = physicalKg + totalKgGenerated
  let adjustedRecords = [...allRecords]
  
  // IF SHORT: Add extra records by reusing the robust generation logic in a loop
  if (totalDecemberKg < TARGET_TOTAL_KG) {
      const missingKg = TARGET_TOTAL_KG - totalDecemberKg
      console.log(`   Faltante: ${missingKg.toLocaleString()} kg - Generando registros extra...`)
      console.log(`   Se distribuirán en los ${workingDays.length} días laborados`)

      let addedKg = 0
      let maxLoops = 5000 // Force fill mode
      
      const validDayKeys = [...workingDays]

      while (addedKg < missingKg && maxLoops > 0) {
          const randomDay = pickRandom(validDayKeys)
          
          const records = await generateRecordsForDay(
             randomDay,
             catalogues,
             1, // Target small, forces 1 trip
             1, // Limit 1 record per call
             [], // No physicals
             true // forceMaxCapacity: USE ALL VEHICLES UP TO MAX LIMIT
          )

          if (records.length > 0) {
              const r = records[0]
              adjustedRecords.push(r)
              addedKg += r.peso
          }
          maxLoops--
      }
      console.log('')
      
      totalKgGenerated = adjustedRecords.reduce((sum, r) => sum + r.peso, 0)
      totalDecemberKg = physicalKg + totalKgGenerated
      console.log(`   Finalizado relleno. Nuevo total: ${totalDecemberKg.toLocaleString()} kg`)
  }

  // If we're over the target, remove records ONLY if the excess is large enough to warrant removing a whole trip
  // Otherwise, we will perform fine-tuning on the weights
  const minRecordWeight = 4000 // Smallest waste is ~5000kg
  
  if (totalDecemberKg > (TARGET_TOTAL_KG + minRecordWeight)) {
    const excessKg = totalDecemberKg - TARGET_TOTAL_KG
    console.log(`   Exceso grande: ${excessKg.toLocaleString()} kg - Removiendo registros...`)

    // Sort valid records (only virtually generated ones are candidates for removal)
    // We can identify them because they don't have an ID yet (id is undefined in local object) 
    // or we implicitly know allRecords contains newly generated ones.
    
    // Sort by peso ascending to remove smallest impact
    adjustedRecords.sort((a, b) => a.peso - b.peso)

    let removedKg = 0
    let recordsToRemove = 0

    // Remove until we are close to target (but not under by too much)
    // Stop when remaining excess is less than the next record's weight
    for (let i = 0; i < adjustedRecords.length; i++) {
        const remainingExcess = (excessKg - removedKg)
        if (remainingExcess < adjustedRecords[i].peso) break // Don't remove if it flips us to deficit
        
        removedKg += adjustedRecords[i].peso
        recordsToRemove++
    }

    // Remove those records
    adjustedRecords = adjustedRecords.slice(recordsToRemove)
    
    // Update totals
    totalKgGenerated = adjustedRecords.reduce((sum, r) => sum + r.peso, 0)
    totalDecemberKg = physicalKg + totalKgGenerated
    
    console.log(`   Registros removidos: ${recordsToRemove}`)
    console.log(`   Peso removido: ${removedKg.toLocaleString()} kg`)
  }
  
  // FINE TUNING STEP
  // Now we are very close to target (either slightly under or slightly over).
  // We will distribute the difference across multiple virtual records to hit EXACTLY (or within rounding)
  
  let diff = TARGET_TOTAL_KG - totalDecemberKg // Positive = Deficit (need to add), Negative = Excess (need to subtract)
  
  if (Math.abs(diff) > 0) {
      console.log(`   🔧 Ajuste fino requerido: ${diff > 0 ? '+' : ''}${diff.toLocaleString()} kg`)
      
      // Distribute diff across all virtual records
      // Limit adjustment per record to keep it realistic (e.g. +/- 500kg max)
      // We will loop randomly or sequentially updating weights
      
      // We need to respect the rounding rule (multiples of 10)
      // So adjustments should be in 10kg steps
      
      // Round diff to nearest 10 first
      diff = Math.round(diff / 10) * 10
      
      if (diff !== 0) {
          const step = diff > 0 ? 10 : -10
          let pending = diff
          let loops = 0
          
          while (pending !== 0 && loops < 100000) {
              // Pick a random record
              const idx = Math.floor(Math.random() * adjustedRecords.length)
              const r = adjustedRecords[idx]
              
              // Validate limits if we modify
              const newWaste = r.peso + step
              const newEntrada = r.peso_entrada + step
              
              // Define hard limits for realism
              let isValid = false
              
              const vehicleInfo = VEHICLES.find(v => v.numero_economico === r.numero_economico)
              
              if (vehicleInfo) {
                  if (vehicleInfo.tipo === 'VOLTEO') {
                      // Volteo Strict: 3600 - 8000 (Allow slight overuse to fit target)
                      if (newWaste >= 3600 && newWaste <= 8000) isValid = true
                  } else {
                      // Carga Trasera: 9000 - 15500
                      if (newWaste >= 9000 && newWaste <= 15500) isValid = true
                  }
              } else {
                  // Fallback if no match
                  if (newWaste >= 3000 && newWaste <= 15000) isValid = true
              }
              
              if (isValid) {
                  r.peso = newWaste
                  r.peso_entrada = newEntrada
                  // peso_salida stays same
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
  totalDecemberKg = physicalKg + totalKgGenerated
  
  console.log('')
  console.log('═'.repeat(80))
  console.log('📊 RESUMEN DEL BACKFILL')
  console.log('═'.repeat(80))
  console.log(`   Registros virtuales borrados:       ${deletedCount}`)
  console.log(`   Registros físicos en diciembre:     ${physicalRecords?.length || 0} (${physicalTons.toFixed(2)} toneladas)`)
  console.log(`   Días procesados:                    ${workingDays.length}`)
  console.log(`   Registros virtuales a crear:        ${adjustedRecords.length}`)
  console.log(`   Kg virtuales generados:             ${totalKgGenerated.toLocaleString()} kg (${(totalKgGenerated / 1000).toFixed(2)} toneladas)`)
  console.log(`   ` + '─'.repeat(78))
  console.log(`   TOTAL DICIEMBRE 2025:               ${totalDecemberKg.toLocaleString()} kg (${(totalDecemberKg / 1000).toFixed(2)} toneladas)`)
  console.log(`   Target objetivo:                    ${TARGET_TOTAL_KG.toLocaleString()} kg (${(TARGET_TOTAL_KG / 1000).toFixed(2)} toneladas)`)
  console.log(`   Diferencia:                         ${(totalDecemberKg - TARGET_TOTAL_KG).toLocaleString()} kg (${((totalDecemberKg / TARGET_TOTAL_KG - 1) * 100).toFixed(1)}%)`)
  console.log('═'.repeat(80))
  console.log('')

  // Replace allRecords with adjusted records
  allRecords.length = 0
  allRecords.push(...adjustedRecords)

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
  console.log(`   Registros virtuales insertados:     ${allRecords.length} (${(totalKgGenerated / 1000).toFixed(2)} toneladas)`)
  console.log(`   Registros físicos existentes:       ${physicalRecords?.length || 0} (${physicalTons.toFixed(2)} toneladas)`)
  console.log(`   ` + '─'.repeat(78))
  console.log(`   TOTAL DICIEMBRE 2025:               ${(physicalRecords?.length || 0) + allRecords.length} registros`)
  console.log(`   TOTAL PESO DICIEMBRE 2025:          ${totalDecemberKg.toLocaleString()} kg (${(totalDecemberKg / 1000).toFixed(2)} toneladas)`)
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
