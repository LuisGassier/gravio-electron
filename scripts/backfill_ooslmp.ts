/**
 * Backfill Script: Generate historical virtual records for OOSLMP (Reusable Version)
 *
 * This script:
 * 1. Deletes all existing virtual records for the specified month
 * 2. Generates new synthetic records with realistic business rules
 *
 * Usage:
 *   Using .env.backfill file:
 *     npx ts-node scripts/backfill_ooslmp.ts
 *
 *   Or with environment variables:
 *     YEAR=2026 MONTH=2 TARGET_KG=2500000 DRY_RUN=false SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node scripts/backfill_ooslmp.ts
 *
 * Environment Variables:
 *   - YEAR: Year (e.g., 2026)
 *   - MONTH: Month number 1-12 (e.g., 1 for January, 2 for February)
 *   - TARGET_KG: Target weight in kg including physical records (e.g., 2814440)
 *   - CLAVE_EMPRESA: Company code (default: 4 for OOSLMP)
 *   - DRY_RUN: false for actual execution, true for dry run (default: true)
 */

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load .env.backfill first, then .env as fallback
console.log('📂 Cargando configuración...')
const envBackfill = dotenv.config({ path: '.env.backfill' })
console.log(`  ✓ .env.backfill cargado: ${envBackfill.parsed ? 'sí' : 'no'}`)
if (envBackfill.parsed?.DRY_RUN) {
  console.log(`    DRY_RUN en .env.backfill: "${envBackfill.parsed.DRY_RUN}"`)
}

dotenv.config({ path: '.env' })
console.log(`  ✓ .env cargado también como fallback`)

console.log(`📋 Valores finales de process.env:`)
console.log(`   - DRY_RUN: "${process.env.DRY_RUN}"`)
console.log(`   - YEAR: "${process.env.YEAR}"`)
console.log(`   - MONTH: "${process.env.MONTH}"`)
console.log(`   - TARGET_KG: "${process.env.TARGET_KG}"`)

// Configuration from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const YEAR = parseInt(process.env.YEAR || '2026', 10)
const MONTH = parseInt(process.env.MONTH || '1', 10) // 1-12
const TARGET_TOTAL_KG = parseInt(process.env.TARGET_KG || '2814440', 10)
const CLAVE_EMPRESA = parseInt(process.env.CLAVE_EMPRESA || '4', 10)
const DRY_RUN = process.env.DRY_RUN?.toLowerCase() !== 'false' // Default to dry run for safety

console.log(`📋 DRY_RUN variable: "${process.env.DRY_RUN}" → ${DRY_RUN ? 'MODO DRY RUN' : 'MODO LIVE'}`)

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  process.exit(1)
}

if (MONTH < 1 || MONTH > 12) {
  console.error('❌ ERROR: MONTH must be between 1 and 12')
  process.exit(1)
}

if (TARGET_TOTAL_KG <= 0) {
  console.error('❌ ERROR: TARGET_KG must be greater than 0')
  process.exit(1)
}

// Calculate date range for the specified month (México time UTC-6)
const START_DATE = new Date(YEAR, MONTH - 1, 1, 0, 0, 0) // First day of month at midnight
START_DATE.setHours(START_DATE.getHours() + 6) // Adjust for UTC-6

const END_DATE = new Date(YEAR, MONTH, 0, 23, 59, 59) // Last day of month at 23:59:59
END_DATE.setHours(END_DATE.getHours() + 6) // Adjust for UTC-6

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

// Constraints
const COLLISION_BUFFER_MINUTES = 15 // Minimum minutes between ANY truck entries
const VEHICLE_COOLDOWN_MINUTES = 300 // 5 hours - minimum time before same truck can return

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

// 9 vehículos reales según especificación de OOSLMP:
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
 * Utility: Round to nearest 10 with natural variation
 * Produces values like 14300, 14310, 14320, etc. (all multiples of 10, no decimals)
 */
function roundToNearestTen(value: number): number {
  const base = Math.round(value / 10) * 10
  // Add variation: only multiples of 10 (-40 to 40 kg)
  const variations = [-40, -30, -20, -10, 0, 10, 20, 30, 40]
  const variation = variations[Math.floor(Math.random() * variations.length)]
  return Math.max(0, base + variation)
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
 * Step 1: Delete all virtual records for the specified month
 */
async function deleteVirtualRecords(): Promise<number> {
  console.log(`🗑️  Buscando registros virtuales de ${MONTH_NAMES[MONTH - 1]} ${YEAR}...`)

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
    // Shifts: Morning (7:30 AM - 3:00 PM), Evening (6:00 PM - 8:00 PM), Night (11:00 PM - 1:00 AM)
    let validShiftRecords = 0
    let totalRecords = records?.length || 0

    if (records && records.length > 0) {
        for (const r of records) {
            // Convert UTC timestamp to Mexico Time (UTC-6)
            const utcDate = new Date(r.fecha_entrada)
            const mxTime = new Date(utcDate.getTime() - (6 * 3600 * 1000))
            const h = mxTime.getUTCHours()

            // Count records in any valid shift window
            if ((h >= 7 && h <= 15) || (h >= 18 && h <= 20) || (h >= 23 || h <= 1)) {
                validShiftRecords++
            }
        }
    }

    const isWorkingDay = validShiftRecords > 0

    if (totalRecords === 0) {
         console.log(`   🏖️  Día inhábil detectado (Sin actividad): ${dayKey}`)
    } else if (!isWorkingDay) {
         console.log(`   🌙 Día inhábil detectado (Solo actividad fuera de horarios de turno): ${dayKey} (${totalRecords} registros total)`)
    } else {
         workingDays.push(dayKey)
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
    .not('registrado_por', 'like', '%SYSTEM%')

  if (error) {
    console.error(`❌ Error al obtener registros físicos para ${dayKey}:`, error)
    return []
  }

  return data || []
}

// Global tracking for constraints across all phases
const GLOBAL_TRACKING = {
  timestamps: [] as Date[],
  vehicleExits: new Map<string, Date>(),
  vehicleDailyTrips: new Map<string, number>(),
  vehicleShiftTrips: new Map<string, number>()
}

/**
 * Step 4: Generate records for a single day
 * Strategy: Generate EXACT number of trips first, then adjust weights to hit target kg
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

  // Register physical records in global tracking
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

  // Determine target trips for this day (12 for weekdays, 1 for Sunday)
  // But subtract physical records already present
  const physicalCount = existingPhysicalRecords.length
  const maxTripsForDay = dayOfWeek === 0 ? 1 : 12
  const targetTrips = Math.max(0, maxTripsForDay - physicalCount)

  // Define shifts
  type Shift = { name: string; startH: number; endH: number; maxTrips: number }
  let shifts: Shift[] = []

  if (dayOfWeek === 0) {
    shifts = [{ name: 'domingo', startH: 16.0, endH: 20.0, maxTrips: 1 }]
  } else {
    shifts = [
      { name: 'mañana', startH: 7.5, endH: 15.0, maxTrips: 9 },
      { name: 'tarde', startH: 18.0, endH: 20.0, maxTrips: 2 },
      { name: 'noche', startH: 23.0, endH: 25.0, maxTrips: 1 }
    ]
  }

  let generatedTrips = 0
  let attempts = 0
  const maxAttempts = 2000

  // Phase 1: Generate EXACTLY targetTrips records with valid timestamps
  while (generatedTrips < targetTrips && attempts < maxAttempts) {
    // Select a shift with available capacity
    let selectedShift: Shift | null = null
    for (const shift of shifts) {
      const globalShiftKey = `global-${dayKey}-${shift.name}`
      const currentGlobalShiftTrips = GLOBAL_TRACKING.vehicleShiftTrips.get(globalShiftKey) || 0

      if (currentGlobalShiftTrips < shift.maxTrips) {
        selectedShift = shift
        break
      }
    }

    if (!selectedShift) {
      // All shifts full, but we need more trips - might not be possible
      break
    }

    // Select a vehicle (prefer vehicles with fewer trips today)
    let selectedVehicle: VehicleSpec | null = null
    let minTripsCount = Infinity

    for (const vehicle of VEHICLES) {
      const dailyTripKey = `${vehicle.numero_economico}-${dayKey}`
      const currentTrips = GLOBAL_TRACKING.vehicleDailyTrips.get(dailyTripKey) || 0

      if (currentTrips < vehicle.viajes_por_dia_max && currentTrips < minTripsCount) {
        minTripsCount = currentTrips
        selectedVehicle = vehicle
      }
    }

    if (!selectedVehicle) {
      // No more vehicles available with capacity
      break
    }

    // Generate timestamp within shift window
    let timestamp: Date | null = null
    const vehicleKey = selectedVehicle.numero_economico
    const lastExit = GLOBAL_TRACKING.vehicleExits.get(vehicleKey)

    for (let i = 0; i < 100; i++) {
        let t = selectedShift.startH + Math.random() * (selectedShift.endH - selectedShift.startH)

        let actualDay = day
        let actualMonth = month
        let actualYear = year
        if (t >= 24) {
          t -= 24
          actualDay += 1
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

        if (lastExit && candidate < lastExit) continue

        if (lastExit && generatedTrips >= 1) {
            const diffMin = (candidate.getTime() - lastExit.getTime()) / 60000
            if (diffMin < VEHICLE_COOLDOWN_MINUTES) continue
        }

        const collision = GLOBAL_TRACKING.timestamps.some(existing =>
            Math.abs(existing.getTime() - candidate.getTime()) < COLLISION_BUFFER_MINUTES * 60000
        )
        if (collision) continue

        timestamp = candidate
        break
    }

    if (!timestamp) {
      attempts++
      continue
    }

    // Generate initial weights based on vehicle type (mid-range for now)
    const round10 = roundToNearestTen
    let pesoSalida: number, pesoEntrada: number, waste: number

    if (selectedVehicle.tipo === 'COMPACTADOR_2_EJES') {
      const pSalidaRaw = sampleTruncatedNormal(14350, 600, selectedVehicle.peso_salida_min, selectedVehicle.peso_salida_max)
      const residuosRaw = sampleTruncatedNormal(13500, 300, selectedVehicle.capacidad_min, selectedVehicle.capacidad_max)
      pesoSalida = round10(pSalidaRaw)
      waste = round10(residuosRaw * loadFactor)
      if (waste < selectedVehicle.capacidad_min) waste = selectedVehicle.capacidad_min
      if (waste > selectedVehicle.capacidad_max) waste = selectedVehicle.capacidad_max
      pesoEntrada = pesoSalida + waste
    } else if (selectedVehicle.tipo === 'COMPACTADOR_1_EJE') {
      const pSalidaRaw = sampleTruncatedNormal(10950, 400, selectedVehicle.peso_salida_min, selectedVehicle.peso_salida_max)
      const residuosRaw = sampleTruncatedNormal(9500, 300, selectedVehicle.capacidad_min, selectedVehicle.capacidad_max)
      pesoSalida = round10(pSalidaRaw)
      waste = round10(residuosRaw * loadFactor)
      if (waste < selectedVehicle.capacidad_min) waste = selectedVehicle.capacidad_min
      if (waste > selectedVehicle.capacidad_max) waste = selectedVehicle.capacidad_max
      pesoEntrada = pesoSalida + waste
    } else {
      const pSalidaRaw = sampleTruncatedNormal(6750, 400, selectedVehicle.peso_salida_min, selectedVehicle.peso_salida_max)
      const residuosRaw = sampleTruncatedNormal(6000, 300, selectedVehicle.capacidad_min, selectedVehicle.capacidad_max)
      pesoSalida = round10(pSalidaRaw)
      waste = round10(residuosRaw * loadFactor)
      if (waste < selectedVehicle.capacidad_min) waste = selectedVehicle.capacidad_min
      if (waste > selectedVehicle.capacidad_max) waste = selectedVehicle.capacidad_max
      pesoEntrada = pesoSalida + waste
    }

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
      numero_economico: selectedVehicle.numero_economico,
      placa_vehiculo: selectedVehicle.placa,
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

    GLOBAL_TRACKING.timestamps.push(timestamp)
    GLOBAL_TRACKING.vehicleExits.set(selectedVehicle.numero_economico, fechaSalida)
    const dailyTripKey = `${selectedVehicle.numero_economico}-${dayKey}`
    const currentTrips = GLOBAL_TRACKING.vehicleDailyTrips.get(dailyTripKey) || 0
    GLOBAL_TRACKING.vehicleDailyTrips.set(dailyTripKey, currentTrips + 1)

    const shiftKey = `global-${dayKey}-${selectedShift.name}`
    const currentShiftTrips = GLOBAL_TRACKING.vehicleShiftTrips.get(shiftKey) || 0
    GLOBAL_TRACKING.vehicleShiftTrips.set(shiftKey, currentShiftTrips + 1)

    generatedTrips++
    attempts = 0
  }

  // No phase 2 adjustment by day - let weights vary naturally
  // Only do fine-tuning at the month level

  records.sort((a, b) => new Date(a.fecha_entrada).getTime() - new Date(b.fecha_entrada).getTime())
  return records
}

/**
 * Main backfill function
 */
async function backfill() {
  console.log('🚀 Iniciando backfill de registros virtuales OOSLMP')
  console.log(`📊 Periodo: ${MONTH_NAMES[MONTH - 1]} ${YEAR}`)
  console.log(`   ${START_DATE.toISOString()} - ${END_DATE.toISOString()}`)
  console.log(`🎯 Target total: ${TARGET_TOTAL_KG.toLocaleString()} kg (${(TARGET_TOTAL_KG / 1000).toFixed(2)} toneladas)`)
  console.log(`🔧 Modo: ${DRY_RUN ? 'DRY RUN (no se modificará nada)' : 'LIVE (modificación real)'}`)
  console.log('')

  const deletedCount = await deleteVirtualRecords()
  console.log('')

  const catalogues = await getCatalogues()
  console.log('')

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
    const match = maxFolio.match(/OOSL-(\d+)/)
    if (match) {
      nextFolioNumber = parseInt(match[1], 10) + 1
    }
  }
  console.log(`   Próximo folio a usar: ${formatFolio(nextFolioNumber)}`)
  console.log('')

  console.log(`📊 Calculando peso de registros físicos en ${MONTH_NAMES[MONTH - 1]} ${YEAR}...`)
  const { data: physicalRecords, error: physicalError } = await supabase
    .from('registros')
    .select('id, peso_entrada, peso_salida, peso, placa_vehiculo')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', START_DATE.toISOString())
    .lte('fecha_entrada', END_DATE.toISOString())
    .not('registrado_por', 'like', '%SYSTEM_GENERATED%')

  if (physicalError) {
    console.error('❌ Error al obtener registros físicos:', physicalError)
    throw physicalError
  }

  // Calculate physical weight: peso_entrada - peso_salida
  const physicalKg = (physicalRecords || []).reduce((sum, r) => {
    const entrada = parseFloat(r.peso_entrada) || 0
    const salida = parseFloat(r.peso_salida) || 0
    const calculatedWeight = entrada - salida
    return sum + (calculatedWeight > 0 ? calculatedWeight : 0)
  }, 0)
  const physicalTons = physicalKg / 1000

  console.log(`   Registros físicos encontrados: ${physicalRecords?.length || 0}`)
  console.log(`   Peso físico total: ${physicalKg.toLocaleString()} kg (${physicalTons.toFixed(2)} toneladas)`)

  const remainingTargetKg = TARGET_TOTAL_KG - physicalKg

  if (remainingTargetKg <= 0) {
    console.log(`   ⚠️  Los registros físicos ya superan el objetivo de ${(TARGET_TOTAL_KG / 1000).toFixed(2)} toneladas`)
    console.log(`   No se generarán registros virtuales.`)
    return
  }

  console.log(`   Target restante para virtuales: ${remainingTargetKg.toLocaleString()} kg (${(remainingTargetKg / 1000).toFixed(2)} toneladas)`)
  console.log('')

  const workingDays = await getWorkingDays()
  console.log('')

  if (workingDays.length === 0) {
    console.log('❌ No se encontraron días laborales. Finalizando.')
    return
  }

  console.log('🏭 Generando registros virtuales...')
  console.log('')

  const allRecords: any[] = []
  let totalKgGenerated = 0
  let currentFolioNumber = nextFolioNumber

  let sundaysCount = 0
  let weekDaysCount = 0

  workingDays.forEach(day => {
    const d = new Date(day + 'T12:00:00')
    if (d.getDay() === 0) sundaysCount++
    else weekDaysCount++
  })

  const sundayTarget = 10000
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
    const physicalRecordsOfDay = await getPhysicalRecordsForDay(dayKey)

    // Generate records with natural weight variation (don't force exact daily target)
    const records = await generateRecordsForDay(
        dayKey,
        catalogues,
        0, // Don't use target in daily generation - let weights vary naturally
        physicalRecordsOfDay
    )

    // Don't assign folio here - will assign all at once at the end
    const physicalKgDay = physicalRecordsOfDay.reduce((sum, r) => sum + (Number(r.peso)||0), 0)
    const dayKg = records.reduce((sum, r) => sum + r.peso, 0)
    totalKgGenerated += dayKg
    allRecords.push(...records)

    const [year, month, day] = dayKey.split('-').map(Number)
    const mexicoDate = new Date(year, month - 1, day)
    const dayOfWeek = mexicoDate.toLocaleDateString('es-MX', { weekday: 'long' })

    console.log(`${dayKey} (${dayOfWeek}): ${physicalRecordsOfDay.length} físicos (${(physicalKgDay/1000).toFixed(1)}t) + ${records.length} virtuales (${(dayKg / 1000).toFixed(1)}t)`)
  }

  console.log('')
  console.log('🎯 Ajustando para alcanzar objetivo exacto...')

  // Get all physical records to adjust them
  console.log('   📊 Obteniendo registros físicos para ajustar...')
  const { data: allPhysicalRecords, error: allPhysicalError } = await supabase
    .from('registros')
    .select('*')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', START_DATE.toISOString())
    .lte('fecha_entrada', END_DATE.toISOString())
    .not('registrado_por', 'like', '%SYSTEM_GENERATED%')

  if (allPhysicalError) {
    console.error('❌ Error al obtener registros físicos:', allPhysicalError)
  }

  let totalJanuaryKg = physicalKg + totalKgGenerated
  let adjustedRecords = [...allRecords]
  let adjustedPhysicalRecords = [...(allPhysicalRecords || [])]

  // Try to adjust physical records within vehicle capacity limits
  let physicalAdjustmentKg = 0
  
  if (totalJanuaryKg < TARGET_TOTAL_KG) {
    const missingKg = TARGET_TOTAL_KG - totalJanuaryKg
    console.log(`   Faltante: ${missingKg.toLocaleString()} kg`)
    console.log(`   📈 Intentando ajustes moderados en registros físicos...`)

    let adjustedKg = 0
    let adjustmentAttempts = 0

    for (const physRecord of adjustedPhysicalRecords) {
      if (adjustedKg >= missingKg) break

      // Find vehicle by placa
      const vehicle = VEHICLES.find(v => v.placa === physRecord.placa_vehiculo)
      if (!vehicle) continue

      const currentWaste = physRecord.peso || 0
      const maxCapacity = vehicle.capacidad_max

      // Only add a MODERATE increase (20-40% of available space, not all)
      if (currentWaste < maxCapacity) {
        const availableSpace = maxCapacity - currentWaste
        // Be conservative: use only 20-40% of available space
        const moderateIncrease = Math.floor(availableSpace * (0.2 + Math.random() * 0.2) / 10) * 10
        
        if (moderateIncrease > 0 && moderateIncrease <= availableSpace && adjustedKg + moderateIncrease <= missingKg) {
          physRecord.peso = currentWaste + moderateIncrease
          physRecord.peso_entrada = (physRecord.peso_salida || currentWaste) + physRecord.peso
          adjustedKg += moderateIncrease
          adjustmentAttempts++
        }
      }
    }

    if (adjustmentAttempts > 0) {
      physicalAdjustmentKg = adjustedKg
      console.log(`   ✅ Registros físicos ajustados: ${adjustmentAttempts} camiones`)
      console.log(`   Kg agregados: ${adjustedKg.toLocaleString()} kg (ajustes moderados)`)
      totalJanuaryKg += adjustedKg
    }
  }

  if (totalJanuaryKg < TARGET_TOTAL_KG) {
      const missingKg = TARGET_TOTAL_KG - totalJanuaryKg
      console.log(`   Faltante aún: ${missingKg.toLocaleString()} kg - Generando registros virtuales extra...`)

      // Calculate how many records we need (estimate ~11 tons per record average)
      const avgKgPerRecord = 11000
      const estimatedRecordsNeeded = Math.ceil(missingKg / avgKgPerRecord)
      console.log(`   Estimado: ${estimatedRecordsNeeded} registros virtuales adicionales`)

      let addedKg = 0
      let recordsAdded = 0
      const validDayKeys = [...workingDays]

      // Generate in batches by day to speed up
      for (let i = 0; i < estimatedRecordsNeeded && addedKg < missingKg; i++) {
          const randomDay = pickRandom(validDayKeys)

          const records = await generateRecordsForDay(
             randomDay,
             catalogues,
             0, // Don't use target, let it vary naturally
             []
          )

          if (records.length > 0) {
              const r = records[0]
              adjustedRecords.push(r)
              addedKg += r.peso
              recordsAdded++
          }
      }

      totalKgGenerated = adjustedRecords.reduce((sum, r) => sum + r.peso, 0)
      totalJanuaryKg = physicalKg + physicalAdjustmentKg + totalKgGenerated
      console.log(`   ✅ Registros virtuales extra generados: ${recordsAdded}`)
      console.log(`   Kg agregados: ${addedKg.toLocaleString()} kg`)
      console.log(`   Nuevo total: ${totalJanuaryKg.toLocaleString()} kg`)
  }

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

  adjustedRecords.sort((a, b) => new Date(a.fecha_entrada).getTime() - new Date(b.fecha_entrada).getTime())

  // Assign folios to all records - MUST be done once, for all records
  let folioNum = nextFolioNumber
  for (const record of adjustedRecords) {
    // Ensure no record already has a folio
    record.folio = formatFolio(folioNum)
    folioNum++
  }

  totalKgGenerated = adjustedRecords.reduce((sum, r) => sum + r.peso, 0)
  totalJanuaryKg = physicalKg + totalKgGenerated

  console.log('')
  console.log('═'.repeat(80))
  console.log('📊 RESUMEN DEL BACKFILL')
  console.log('═'.repeat(80))
  console.log(`   Registros virtuales borrados:       ${deletedCount}`)
  console.log(`   Registros físicos en ${MONTH_NAMES[MONTH - 1]}:         ${physicalRecords?.length || 0} (${physicalTons.toFixed(2)} toneladas)`)
  console.log(`   Días procesados:                    ${workingDays.length}`)
  console.log(`   Registros virtuales a crear:        ${adjustedRecords.length}`)
  console.log(`   Kg virtuales generados:             ${totalKgGenerated.toLocaleString()} kg (${(totalKgGenerated / 1000).toFixed(2)} toneladas)`)
  console.log(`   ` + '─'.repeat(78))
  console.log(`   TOTAL ${MONTH_NAMES[MONTH - 1]} ${YEAR}:                   ${totalJanuaryKg.toLocaleString()} kg (${(totalJanuaryKg / 1000).toFixed(2)} toneladas)`)
  console.log(`   Target objetivo:                    ${TARGET_TOTAL_KG.toLocaleString()} kg (${(TARGET_TOTAL_KG / 1000).toFixed(2)} toneladas)`)
  console.log(`   Diferencia:                         ${(totalJanuaryKg - TARGET_TOTAL_KG).toLocaleString()} kg (${((totalJanuaryKg / TARGET_TOTAL_KG - 1) * 100).toFixed(1)}%)`)
  console.log('═'.repeat(80))
  console.log('')

  allRecords.length = 0
  allRecords.push(...adjustedRecords)

  if (DRY_RUN) {
    console.log('🔍 DRY RUN - No se modificó la base de datos')
    console.log('   Para ejecutar la inserción real, asegúrate que .env.backfill tenga:')
    console.log('   DRY_RUN=false')
    console.log('   Luego ejecuta: npx ts-node scripts/backfill_ooslmp.ts')
    console.log('')
    return
  }

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
  console.log(`   TOTAL ${MONTH_NAMES[MONTH - 1]} ${YEAR}:                   ${(physicalRecords?.length || 0) + allRecords.length} registros`)
  console.log(`   TOTAL PESO ${MONTH_NAMES[MONTH - 1]} ${YEAR}:              ${totalJanuaryKg.toLocaleString()} kg (${(totalJanuaryKg / 1000).toFixed(2)} toneladas)`)
  console.log('')
}

backfill().catch(err => {
  console.error('')
  console.error('═'.repeat(80))
  console.error('❌ ERROR FATAL')
  console.error('═'.repeat(80))
  console.error(err)
  console.error('')
  process.exit(1)
})
