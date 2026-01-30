import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.backfill' })
dotenv.config({ path: '.env' })

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const CLAVE_EMPRESA = 4

// January 2026
const START_DATE = '2026-01-01T06:00:00Z'
const END_DATE = '2026-02-01T06:00:00Z'
const TARGET_TOTAL_KG = 2814440

// Vehicle Types (Según CSV REGLAS MES DE ENERO 2026)
const VEHICLES = [
  // Compactador 2 ejes: 13,000-14,000 kg
  { numero_economico: '2020', tipo: 'COMPACTADOR_2_EJES', capacidad_min: 13000, capacidad_max: 14000 },
  { numero_economico: '2025', tipo: 'COMPACTADOR_2_EJES', capacidad_min: 13000, capacidad_max: 14000 },
  // Compactador 1 eje: 9,000-10,000 kg
  { numero_economico: '5', tipo: 'COMPACTADOR_1_EJE', capacidad_min: 9000, capacidad_max: 10000 },
  { numero_economico: '6', tipo: 'COMPACTADOR_1_EJE', capacidad_min: 9000, capacidad_max: 10000 },
  // Volteo: 5,500-6,500 kg
  { numero_economico: '2012-2', tipo: 'VOLTEO', capacidad_min: 5500, capacidad_max: 6500 },
  { numero_economico: '2015', tipo: 'VOLTEO', capacidad_min: 5500, capacidad_max: 6500 },
  { numero_economico: '2012', tipo: 'VOLTEO', capacidad_min: 5500, capacidad_max: 6500 },
  { numero_economico: '2012-3', tipo: 'VOLTEO', capacidad_min: 5500, capacidad_max: 6500 },
  { numero_economico: '2012-4', tipo: 'VOLTEO', capacidad_min: 5500, capacidad_max: 6500 }
]

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
})

function getMexicoTime(utcIso: string): { date: Date; hour: number; dayOfWeek: number } {
  const d = new Date(utcIso)
  const mxTime = new Date(d.getTime() - (6 * 60 * 60 * 1000)) // UTC-6
  const hour = mxTime.getUTCHours() + mxTime.getUTCMinutes() / 60
  const dayOfWeek = mxTime.getUTCDay() // 0=Sunday, 1-6=Mon-Sat
  return { date: mxTime, hour, dayOfWeek }
}

async function verify() {
  console.log('🔍 Verificando reglas de negocio para Enero 2026...\n')

  const { data: records, error } = await supabase
    .from('registros')
    .select('*')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', START_DATE)
    .lt('fecha_entrada', END_DATE)
    .order('fecha_entrada', { ascending: true })

  if (error) {
    console.error('Error fetching:', error)
    return
  }

  console.log(`📄 Registros analizados: ${records.length}\n`)

  let errors: string[] = []
  let warnings: string[] = []

  // 0. Check total weight
  const physicalRecords = records.filter(r => !r.registrado_por?.includes('SYSTEM'))
  const virtualRecords = records.filter(r => r.registrado_por?.includes('SYSTEM'))

  // Para físicos: peso = entrada - salida
  // Para virtuales: peso tal como está
  const physicalKg = physicalRecords.reduce((sum, r) => sum + ((Number(r.peso_entrada) || 0) - (Number(r.peso_salida) || 0)), 0)
  const virtualKg = virtualRecords.reduce((sum, r) => sum + (Number(r.peso) || 0), 0)
  const totalKg = physicalKg + virtualKg
  const targetTons = TARGET_TOTAL_KG / 1000
  const totalTons = totalKg / 1000

  console.log(`📊 Peso Total:`)
  console.log(`   - Registros físicos: ${physicalRecords.length} (${(physicalKg / 1000).toFixed(2)} t)`)
  console.log(`   - Registros virtuales: ${virtualRecords.length} (${(virtualKg / 1000).toFixed(2)} t)`)
  console.log(`   - TOTAL: ${totalTons.toFixed(2)} t (Target: ${targetTons.toFixed(2)} t)`)

  if (Math.abs(totalTons - targetTons) > 0.01) {
    errors.push(`❌ Peso total fuera de objetivo: ${totalTons.toFixed(2)} t vs ${targetTons.toFixed(2)} t (diferencia: ${(totalTons - targetTons).toFixed(2)} t)`)
  } else {
    console.log(`✅ Peso total: Correcto\n`)
  }

  // 1. Check 31st of January (should have no virtual records)
  const jan31Records = records.filter(r => {
    const { date } = getMexicoTime(r.fecha_entrada)
    return date.getUTCMonth() === 0 && date.getUTCDate() === 31
  })

  const jan31Virtuals = jan31Records.filter(r => r.registrado_por?.includes('SYSTEM'))
  if (jan31Virtuals.length > 0) {
    errors.push(`❌ Se encontraron ${jan31Virtuals.length} registros virtuales el 31 de Enero (Debería ser 0)`)
  } else {
    console.log(`✅ 31 de Enero: Sin registros virtuales (Correcto)`)
  }

  // 2. Check decimals and multiples of 10
  let decimalsFail = 0
  let multiple10Fail = 0

  records.forEach(r => {
    if (r.peso % 1 !== 0 || r.peso_entrada % 1 !== 0 || r.peso_salida % 1 !== 0) decimalsFail++
    if (r.peso % 10 !== 0) multiple10Fail++
  })

  if (decimalsFail > 0) {
    errors.push(`❌ ${decimalsFail} registros con decimales (deben ser enteros)`)
  } else {
    console.log(`✅ Pesos: Sin decimales`)
  }

  if (multiple10Fail > 0) {
    errors.push(`❌ ${multiple10Fail} registros con peso no múltiplo de 10`)
  } else {
    console.log(`✅ Pesos: Múltiplos de 10`)
  }

  // 3. Check horarios (solo virtuales)
  let hoursFail = 0
  virtualRecords.forEach(r => {
    const { hour, dayOfWeek } = getMexicoTime(r.fecha_entrada)

    let valid = false
    if (dayOfWeek === 0) {
      // Sunday: 16:00-21:00
      if (hour >= 16 && hour < 21) valid = true
    } else {
      // Mon-Sat: 07:30-15:00, 18:00-20:00, 23:00-01:00
      if ((hour >= 7.5 && hour < 15) || (hour >= 18 && hour < 20) || (hour >= 23 || hour < 1)) valid = true
    }

    if (!valid) {
      hoursFail++
    }
  })

  if (hoursFail > 0) {
    errors.push(`❌ ${hoursFail} registros virtuales fuera de horario`)
  } else {
    console.log(`✅ Horarios: Todos dentro de rango`)
  }

  // 4. Check Folio Sequence (solo OOSL, ignora PALA)
  const getFolioNum = (f: string) => parseInt(f.replace('OOSL-', '').replace('PALA-', ''), 10)

  const ooslRecords = records.filter(r => r.folio.startsWith('OOSL'))
    .sort((a, b) => getFolioNum(a.folio) - getFolioNum(b.folio))
  
  let sequenceBreaks = 0
  const gaps = []
  for (let i = 1; i < ooslRecords.length; i++) {
    const prev = getFolioNum(ooslRecords[i - 1].folio)
    const curr = getFolioNum(ooslRecords[i].folio)

    if (curr !== prev + 1) {
      sequenceBreaks += curr - prev - 1
      gaps.push(`${prev + 1}-${curr - 1}`)
    }
  }

  if (sequenceBreaks > 0) {
    errors.push(`❌ ${sequenceBreaks} saltos en secuencia de folios OOSL (gaps: ${gaps.join(', ')})`)
  } else {
    console.log(`✅ Folios OOSL: Consecutivos y ordenados`)
  }

  // 5. Vehicle Frequency (60 min minimum between entries)
  const lastEntryTime = new Map<string, Date>()
  let frequencyErrors = 0

  records.forEach(r => {
    if (!r.numero_economico) return

    const current = new Date(r.fecha_entrada)
    const last = lastEntryTime.get(r.numero_economico)

    if (last) {
      const diffMinutes = (current.getTime() - last.getTime()) / (1000 * 60)
      if (diffMinutes < 60) {
        // Only fail if virtual
        if (r.registrado_por?.includes('SYSTEM')) {
          frequencyErrors++
        }
      }
    }
    lastEntryTime.set(r.numero_economico, current)
  })

  if (frequencyErrors > 0) {
    errors.push(`❌ ${frequencyErrors} entradas virtuales con menos de 60 min entre registros`)
  } else {
    console.log(`✅ Frecuencia: Descanso de 60+ min entre viajes`)
  }

  // 6. Weight Constraints by Vehicle Type
  let rangeErrors = 0
  virtualRecords.forEach(r => {
    const vehicle = VEHICLES.find(v => v.numero_economico === r.numero_economico)
    if (!vehicle) return

    if (r.peso < vehicle.capacidad_min || r.peso > vehicle.capacidad_max) {
      rangeErrors++
      console.log(`   🔸 Vehículo ${r.numero_economico} (${vehicle.tipo}): Peso ${r.peso} kg fuera de rango [${vehicle.capacidad_min}-${vehicle.capacidad_max}]`)
    }
  })

  if (rangeErrors > 0) {
    warnings.push(`⚠️ ${rangeErrors} registros virtuales con pesos fuera de rango de capacidad`)
  } else {
    console.log(`✅ Rangos de peso: Dentro de capacidad de vehículos`)
  }

  // 7. Daily trips per vehicle
  const tripsPerDay = new Map<string, number>()
  records.forEach(r => {
    if (!r.numero_economico) return
    const { date } = getMexicoTime(r.fecha_entrada)
    const dateKey = date.toISOString().split('T')[0]
    const key = `${r.numero_economico}|${dateKey}`
    tripsPerDay.set(key, (tripsPerDay.get(key) || 0) + 1)
  })

  let dailyLimitErrors = 0
  for (const [key, count] of tripsPerDay) {
    const [eco, dateStr] = key.split('|')
    const d = new Date(dateStr)
    const dayOfWeek = d.getUTCDay()

    let maxTrips = 0
    if (dayOfWeek === 0) maxTrips = 1 // Sunday
    else maxTrips = 12 // Mon-Sat

    if (count > maxTrips) {
      dailyLimitErrors++
      console.log(`   🔸 Vehículo ${eco} el ${dateStr}: ${count} viajes (máx ${maxTrips})`)
    }
  }

  if (dailyLimitErrors > 0) {
    errors.push(`❌ ${dailyLimitErrors} vehículos excedieron límite diario de viajes`)
  } else {
    console.log(`✅ Límites diarios: Respetados`)
  }

  console.log('\n' + '═'.repeat(80))
  if (errors.length > 0) {
    console.log('🛑 SE ENCONTRARON ERRORES:')
    errors.forEach(e => console.error(e))
  } else {
    console.log('✨ TODO CORRECTO. Los datos cumplen las reglas de negocio.')
  }

  if (warnings.length > 0) {
    console.log('\n⚠️ Advertencias:')
    warnings.forEach(w => console.warn(w))
  }

  console.log('═'.repeat(80))
}

verify().catch(console.error)
