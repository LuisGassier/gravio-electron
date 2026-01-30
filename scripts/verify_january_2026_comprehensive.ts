/**
 * Comprehensive Verification Script for January 2026 - PHYSICAL + VIRTUAL
 * 
 * Validates ALL records (physical + virtual) against business rules:
 * - Unknown vehicles
 * - Coherencia placa ↔ número económico
 * - Trip frequency (120 min minimum for ALL records)
 * - Daily trip limits (12 max per vehicle Mon-Sat, 1 on Sunday)
 * - Weight ranges (RSU)
 * - Horarios
 * - Folio sequence
 * - Múltiplos de 10 y sin decimales
 * - No actividad el 31 de enero
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.backfill' })
dotenv.config({ path: '.env' })

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const CLAVE_EMPRESA = 4

// January 2026 (Mexico time boundaries)
const START_DATE = '2025-12-31T06:00:00Z' // Jan 1 00:00 Mexico = Dec 31 06:00 UTC
const END_DATE = '2026-02-01T06:00:00Z'   // Feb 1 00:00 Mexico = Feb 1 06:00 UTC
const TARGET_TOTAL_KG = 2814440

// Known vehicles (from CSV REGLAS MES DE ENERO 2026)
const KNOWN_VEHICLES = [
  // Compactador 2 ejes
  { numero_economico: '2017', placa: 'SP85738', tipo: 'COMP_2_EJES', cap_min: 13000, cap_max: 14000 },
  { numero_economico: '2018', placa: 'SP85739', tipo: 'COMP_2_EJES', cap_min: 13000, cap_max: 14000 },
  // Compactador 1 eje
  { numero_economico: '2013', placa: 'SN43215', tipo: 'COMP_1_EJE', cap_min: 9000, cap_max: 10000 },
  { numero_economico: '2013-2', placa: 'SN46198', tipo: 'COMP_1_EJE', cap_min: 9000, cap_max: 10000 },
  { numero_economico: '2010', placa: 'SM02293', tipo: 'COMP_1_EJE', cap_min: 9000, cap_max: 10000 },
  // Volteo
  { numero_economico: '2015', placa: 'SP81281', tipo: 'VOLTEO', cap_min: 5500, cap_max: 6500 },
  { numero_economico: '2012', placa: 'SN31022', tipo: 'VOLTEO', cap_min: 5500, cap_max: 6500 },
  { numero_economico: '2012-2', placa: 'SN31025', tipo: 'VOLTEO', cap_min: 5500, cap_max: 6500 },
  { numero_economico: '2012-3', placa: 'SN43220', tipo: 'VOLTEO', cap_min: 5500, cap_max: 6500 },
]

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
})

function getMexicoTime(utcIso: string): { date: Date; hour: number; dayOfWeek: number; day: number; month: number; year: number } {
  const d = new Date(utcIso)
  const mxTime = new Date(d.getTime() - (6 * 60 * 60 * 1000)) // UTC-6
  const hour = mxTime.getUTCHours() + mxTime.getUTCMinutes() / 60
  const dayOfWeek = mxTime.getUTCDay() // 0=Sunday, 1-6=Mon-Sat
  return { 
    date: mxTime, 
    hour, 
    dayOfWeek,
    day: mxTime.getUTCDate(),
    month: mxTime.getUTCMonth() + 1,
    year: mxTime.getUTCFullYear()
  }
}

const VEHICLE_BY_NUM = new Map(KNOWN_VEHICLES.map(v => [v.numero_economico, v]))
const VEHICLE_BY_PLATE = new Map(KNOWN_VEHICLES.map(v => [v.placa, v]))

function resolveVehicle(record: any) {
  const byNum = record.numero_economico ? VEHICLE_BY_NUM.get(record.numero_economico) : undefined
  const byPlate = record.placa_vehiculo ? VEHICLE_BY_PLATE.get(record.placa_vehiculo) : undefined
  return {
    byNum,
    byPlate,
    resolved: byNum || byPlate || null
  }
}

function getPesoRSU(record: any): number {
  const entrada = Number(record.peso_entrada) || 0
  const salida = Number(record.peso_salida) || 0
  const diff = entrada - salida
  if (diff > 0) return diff
  const peso = Number(record.peso) || 0
  return peso
}

function isWithinHorario(dayOfWeek: number, hour: number): boolean {
  if (dayOfWeek === 0) {
    // Sunday 16:00 - 20:00
    return hour >= 16 && hour <= 20
  }
  // Mon-Sat: 7:30-15:00, 18:00-20:00, 23:00-01:00
  const inMorning = hour >= 7.5 && hour <= 15
  const inEvening = hour >= 18 && hour <= 20
  const inNight = hour >= 23 || hour < 1
  return inMorning || inEvening || inNight
}

async function verify() {
  console.log('🔍 VERIFICACIÓN COMPREHENSIVA - Enero 2026 (FÍSICOS + VIRTUALES)\n')

  const { data: records, error } = await supabase
    .from('registros')
    .select('*')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', START_DATE)
    .lt('fecha_entrada', END_DATE)
    .order('fecha_entrada', { ascending: true })

  if (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }

  // Filter to January 2026 in Mexico time
  const januaryRecords = records.filter(r => {
    const mx = getMexicoTime(r.fecha_entrada)
    return mx.month === 1 && mx.year === 2026
  })

  const physicalRecords = januaryRecords.filter(r => !r.registrado_por?.includes('SYSTEM'))
  const virtualRecords = januaryRecords.filter(r => r.registrado_por?.includes('SYSTEM'))

  console.log(`📄 Registros totales: ${januaryRecords.length}`)
  console.log(`   - Físicos: ${physicalRecords.length}`)
  console.log(`   - Virtuales: ${virtualRecords.length}\n`)

  const errors: string[] = []
  const warnings: string[] = []

  // 1. CHECK UNKNOWN VEHICLES + PLATE/NUMERO MISMATCH
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('1️⃣ VEHÍCULOS DESCONOCIDOS\n')
  
  const unknownVehicles = new Set<string>()
  const mismatchedVehicles: { folio: string; numero: string; placa: string; expected: string }[] = []
  januaryRecords.forEach(r => {
    const { byNum, byPlate, resolved } = resolveVehicle(r)
    if (!resolved) {
      if (r.numero_economico) unknownVehicles.add(r.numero_economico)
      else if (r.placa_vehiculo) unknownVehicles.add(r.placa_vehiculo)
      return
    }
    if (byNum && r.placa_vehiculo && byNum.placa !== r.placa_vehiculo) {
      mismatchedVehicles.push({
        folio: r.folio,
        numero: r.numero_economico,
        placa: r.placa_vehiculo,
        expected: byNum.placa
      })
    }
    if (byPlate && r.numero_economico && byPlate.numero_economico !== r.numero_economico) {
      mismatchedVehicles.push({
        folio: r.folio,
        numero: r.numero_economico,
        placa: r.placa_vehiculo,
        expected: byPlate.numero_economico
      })
    }
  })

  if (unknownVehicles.size > 0) {
    errors.push(`❌ ${unknownVehicles.size} vehículos NO están en la lista oficial`)
    console.log(`❌ Vehículos desconocidos (${unknownVehicles.size}):`)
    unknownVehicles.forEach(v => {
      const count = januaryRecords.filter(r => r.numero_economico === v).length
      console.log(`   🔸 ${v} (${count} registros)`)
    })
  } else {
    console.log(`✅ Todos los vehículos están en la lista oficial`)
  }

  if (mismatchedVehicles.length > 0) {
    errors.push(`❌ ${mismatchedVehicles.length} registros con placa/numero económico incoherentes`)
    console.log(`❌ Placa/numero económico incoherentes (${mismatchedVehicles.length}):`)
    mismatchedVehicles.slice(0, 20).forEach(m => {
      console.log(`   🔸 ${m.folio}: ${m.numero} con placa ${m.placa} (esperado ${m.expected})`)
    })
    if (mismatchedVehicles.length > 20) {
      console.log(`   ... y ${mismatchedVehicles.length - 20} más`)
    }
  } else {
    console.log(`✅ Placa y número económico coherentes`)
  }

  // 1b. CHECK WEIGHT RANGES + MULTIPLES OF 10
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('1️⃣b PESOS (RANGOS, MÚLTIPLOS DE 10, SIN DECIMALES)\n')

  const weightRangeIssues: string[] = []
  let nonMultipleCount = 0
  januaryRecords.forEach(r => {
    const { resolved } = resolveVehicle(r)
    const peso = getPesoRSU(r)
    if (!Number.isInteger(peso) || peso % 10 !== 0) nonMultipleCount++
    if (resolved) {
      if (peso < resolved.cap_min || peso > resolved.cap_max) {
        weightRangeIssues.push(`${r.folio} ${resolved.numero_economico}: ${peso} kg (rango ${resolved.cap_min}-${resolved.cap_max})`)
      }
    }
  })

  if (weightRangeIssues.length > 0) {
    errors.push(`❌ ${weightRangeIssues.length} registros fuera de rango de peso`)
    weightRangeIssues.slice(0, 20).forEach(w => console.log(`   🔸 ${w}`))
    if (weightRangeIssues.length > 20) console.log(`   ... y ${weightRangeIssues.length - 20} más`)
  } else {
    console.log(`✅ Todos los pesos están dentro de rango`)
  }

  if (nonMultipleCount > 0) {
    errors.push(`❌ ${nonMultipleCount} pesos no son múltiplos de 10 o tienen decimales`)
    console.log(`❌ Pesos no múltiplos de 10 / con decimales: ${nonMultipleCount}`)
  } else {
    console.log(`✅ Pesos sin decimales y múltiplos de 10`)
  }

  // 2. CHECK TRIP FREQUENCY (120 min = 2 hours minimum for ALL)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('2️⃣ FRECUENCIA DE VIAJES (Mínimo 2 horas entre viajes)\n')

  const lastEntryByVehicle = new Map<string, Date>()
  const frequencyViolations: any[] = []

  januaryRecords.forEach(r => {
    const { resolved } = resolveVehicle(r)
    const vehicleKey = resolved?.numero_economico || r.numero_economico
    if (!vehicleKey) return

    const current = new Date(r.fecha_entrada)
    const last = lastEntryByVehicle.get(vehicleKey)

    if (last) {
      const diffMinutes = (current.getTime() - last.getTime()) / (1000 * 60)
      if (diffMinutes < 120) { // 2 hours
        const mx = getMexicoTime(r.fecha_entrada)
        frequencyViolations.push({
          folio: r.folio,
          vehicle: vehicleKey,
          date: mx.date.toLocaleDateString(),
          time: mx.date.toLocaleTimeString(),
          diffMinutes: Math.round(diffMinutes),
          isVirtual: r.registrado_por?.includes('SYSTEM')
        })
      }
    }
    lastEntryByVehicle.set(vehicleKey, current)
  })

  if (frequencyViolations.length > 0) {
    errors.push(`❌ ${frequencyViolations.length} registros con menos de 2 horas entre viajes`)
    console.log(`❌ Violaciones de frecuencia (${frequencyViolations.length}):\n`)
    frequencyViolations.slice(0, 20).forEach(v => {
      const type = v.isVirtual ? '[VIRTUAL]' : '[FÍSICO]'
      console.log(`   ${type} ${v.folio} - ${v.vehicle} @ ${v.date} ${v.time} (${v.diffMinutes} min después)`)
    })
    if (frequencyViolations.length > 20) {
      console.log(`   ... y ${frequencyViolations.length - 20} más`)
    }
  } else {
    console.log(`✅ Todos los viajes tienen mínimo 2 horas de diferencia`)
  }

  // 3. CHECK DAILY TRIP LIMITS
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('3️⃣ LÍMITES DIARIOS (12 max Lun-Sáb, 1 max Domingo)\n')

  const tripsByVehicleDay = new Map<string, number>()
  januaryRecords.forEach(r => {
    const { resolved } = resolveVehicle(r)
    const vehicleKey = resolved?.numero_economico || r.numero_economico
    if (!vehicleKey) return
    const mx = getMexicoTime(r.fecha_entrada)
    const dateKey = `${mx.date.toISOString().split('T')[0]}`
    const key = `${vehicleKey}|${dateKey}`
    tripsByVehicleDay.set(key, (tripsByVehicleDay.get(key) || 0) + 1)
  })

  const dailyLimitViolations: any[] = []
  for (const [key, count] of tripsByVehicleDay) {
    const [vehicle, dateStr] = key.split('|')
    const d = new Date(dateStr + 'T00:00:00Z')
    const dayOfWeek = d.getUTCDay()
    
    let maxTrips = 0
    if (dayOfWeek === 0) maxTrips = 1 // Sunday
    else maxTrips = 12 // Mon-Sat

    if (count > maxTrips) {
      dailyLimitViolations.push({
        vehicle,
        date: dateStr,
        count,
        max: maxTrips,
        day: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dayOfWeek]
      })
    }
  }

  if (dailyLimitViolations.length > 0) {
    errors.push(`❌ ${dailyLimitViolations.length} días con exceso de viajes por vehículo`)
    console.log(`❌ Límites diarios excedidos (${dailyLimitViolations.length}):\n`)
    dailyLimitViolations.forEach(v => {
      console.log(`   🔸 ${v.vehicle} el ${v.date} (${v.day}): ${v.count} viajes (máx ${v.max})`)
    })
  } else {
    console.log(`✅ Todos los vehículos respetan límites diarios`)
  }

  // 4. HORARIOS + 31 ENERO + FOLIOS
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('4️⃣ HORARIOS + 31 ENERO + FOLIOS\n')

  let horarioErrors = 0
  let jan31Count = 0
  const ooslFolios = januaryRecords
    .filter(r => String(r.folio || '').startsWith('OOSL-'))
    .map(r => r.folio)
    .sort((a: string, b: string) => {
      const na = parseInt(a.replace('OOSL-', ''), 10)
      const nb = parseInt(b.replace('OOSL-', ''), 10)
      return na - nb
    })

  januaryRecords.forEach(r => {
    const mx = getMexicoTime(r.fecha_entrada)
    if (!isWithinHorario(mx.dayOfWeek, mx.hour)) horarioErrors++
    if (mx.day === 31) jan31Count++
  })

  if (horarioErrors > 0) {
    errors.push(`❌ ${horarioErrors} registros fuera de horario`)
    console.log(`❌ Horarios inválidos: ${horarioErrors}`)
  } else {
    console.log('✅ Horarios dentro de rango')
  }

  if (jan31Count > 0) {
    errors.push(`❌ ${jan31Count} registros encontrados en 31 de enero (debe ser 0)`)
    console.log(`❌ Registros en 31 de enero: ${jan31Count}`)
  } else {
    console.log('✅ 31 de enero sin registros')
  }

  let folioBreaks = 0
  for (let i = 1; i < ooslFolios.length; i++) {
    const prev = parseInt(ooslFolios[i - 1].replace('OOSL-', ''), 10)
    const curr = parseInt(ooslFolios[i].replace('OOSL-', ''), 10)
    if (curr !== prev + 1) folioBreaks += (curr - prev - 1)
  }
  if (folioBreaks > 0) {
    errors.push(`❌ ${folioBreaks} folios faltantes en secuencia OOSL`)
    console.log(`❌ Folios con saltos: ${folioBreaks}`)
  } else {
    console.log('✅ Folios OOSL consecutivos')
  }

  // 5. SUMMARY
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  if (errors.length > 0) {
    console.log('🛑 SE ENCONTRARON ERRORES:\n')
    errors.forEach(e => console.error(e))
  } else {
    console.log('✨ TODO CORRECTO')
  }

  if (warnings.length > 0) {
    console.log('\n⚠️ Advertencias:\n')
    warnings.forEach(w => console.warn(w))
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

verify().catch(console.error)
