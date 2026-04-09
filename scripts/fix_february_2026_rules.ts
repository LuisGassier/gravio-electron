import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.backfill' })
dotenv.config({ path: '.env' })

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const CLAVE_EMPRESA = 4
const START_DATE = '2026-02-01T06:00:00Z'
const END_DATE = '2026-03-01T06:00:00Z'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
})

type VehicleRule = {
  capMin: number
  capMax: number
}

const VEHICLE_BY_PLATE: Record<string, VehicleRule> = {
  SP85738: { capMin: 13000, capMax: 14000 },
  SP85739: { capMin: 13000, capMax: 14000 },
  SN43215: { capMin: 9000, capMax: 10000 },
  SN46198: { capMin: 9000, capMax: 10000 },
  SM02293: { capMin: 9000, capMax: 10000 },
  SP81281: { capMin: 5500, capMax: 6500 },
  SN31022: { capMin: 5500, capMax: 6500 },
  SN31025: { capMin: 5500, capMax: 6500 },
  SN43220: { capMin: 5500, capMax: 6500 },
}

function getMexicoDate(utcIso: string): Date {
  const d = new Date(utcIso)
  return new Date(d.getTime() - 6 * 60 * 60 * 1000)
}

function toUtcIsoFromMexicoDate(mxDate: Date): string {
  const utc = new Date(mxDate.getTime() + 6 * 60 * 60 * 1000)
  return utc.toISOString()
}

function getHourFraction(mxDate: Date): number {
  return mxDate.getUTCHours() + mxDate.getUTCMinutes() / 60
}

function isValidHorario(dayOfWeek: number, hour: number): boolean {
  if (dayOfWeek === 0) return hour >= 16 && hour <= 20
  const inMorning = hour >= 7.5 && hour <= 15
  const inEvening = hour >= 18 && hour <= 20
  const inNight = hour >= 23 || hour < 1
  return inMorning || inEvening || inNight
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function round10(n: number): number {
  return Math.round(n / 10) * 10
}

function chooseInsideRange(min: number, max: number): number {
  const safeMin = min + 80
  const safeMax = max - 80
  const target = randomInt(safeMin, safeMax)
  return round10(target)
}

function moveToValidHorario(fechaEntradaUtc: string, fechaSalidaUtc: string): { entrada: string; salida: string } {
  const mxIn = getMexicoDate(fechaEntradaUtc)
  const mxOut = getMexicoDate(fechaSalidaUtc)
  const rawDurationMin = Math.round((mxOut.getTime() - mxIn.getTime()) / 60000)
  const boundedDurationMin = rawDurationMin >= 10 && rawDurationMin <= 20
    ? rawDurationMin
    : randomInt(10, 20)
  const durationMs = boundedDurationMin * 60 * 1000

  const dayOfWeek = mxIn.getUTCDay()

  let startHour = 8
  let endHour = 14

  if (dayOfWeek === 0) {
    startHour = 16
    endHour = 19
  } else {
    const slots: Array<[number, number]> = [
      [7.5, 14.5],
      [18, 19.5],
      [23, 23.8],
    ]
    const pick = slots[randomInt(0, slots.length - 1)]
    startHour = pick[0]
    endHour = pick[1]
  }

  const chosen = startHour + Math.random() * Math.max(0.1, endHour - startHour)
  const hh = Math.floor(chosen)
  const mm = Math.floor((chosen - hh) * 60)
  const ss = randomInt(0, 59)

  const fixedMxIn = new Date(mxIn)
  fixedMxIn.setUTCHours(hh, mm, ss, 0)

  const fixedMxOut = new Date(fixedMxIn.getTime() + durationMs)

  return {
    entrada: toUtcIsoFromMexicoDate(fixedMxIn),
    salida: toUtcIsoFromMexicoDate(fixedMxOut),
  }
}

async function run() {
  console.log('🔧 Fix Febrero 2026: rangos de peso + horarios (clave 4)')

  const { data: records, error } = await supabase
    .from('registros')
    .select('id, folio, placa_vehiculo, peso_entrada, peso_salida, peso, fecha_entrada, fecha_salida')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', START_DATE)
    .lt('fecha_entrada', END_DATE)
    .order('fecha_entrada', { ascending: true })

  if (error || !records) {
    console.error('❌ Error fetching records:', error)
    process.exit(1)
  }

  const originalTotal = records.reduce((s, r) => s + (Number(r.peso) || 0), 0)

  type Patch = {
    id: string
    newPeso: number
    newEntrada: number
    newSalida: number
    capMin: number
    capMax: number
    needHorarioFix: boolean
    fechaEntrada: string
    fechaSalida: string
  }

  const patches: Patch[] = []

  for (const r of records) {
    const rule = VEHICLE_BY_PLATE[r.placa_vehiculo as string]
    if (!rule) continue

    const salida = Number(r.peso_salida)
    const entrada = Number(r.peso_entrada)
    const rsu = Number(r.peso)

    const mx = getMexicoDate(String(r.fecha_entrada))
    const hour = getHourFraction(mx)
    const dow = mx.getUTCDay()
    const horarioInvalid = !isValidHorario(dow, hour)
    const durationMin = Math.round((new Date(String(r.fecha_salida)).getTime() - new Date(String(r.fecha_entrada)).getTime()) / 60000)
    const durationInvalid = durationMin < 10 || durationMin > 20

    let targetRsu = rsu
    if (rsu < rule.capMin || rsu > rule.capMax) {
      targetRsu = chooseInsideRange(rule.capMin, rule.capMax)
    }

    if (targetRsu !== rsu || horarioInvalid || durationInvalid) {
      patches.push({
        id: String(r.id),
        newPeso: targetRsu,
        newSalida: salida,
        newEntrada: salida + targetRsu,
        capMin: rule.capMin,
        capMax: rule.capMax,
        needHorarioFix: horarioInvalid || durationInvalid,
        fechaEntrada: String(r.fecha_entrada),
        fechaSalida: String(r.fecha_salida),
      })
    }
  }

  const currentTotal = records.reduce((s, r) => s + (Number(r.peso) || 0), 0)
  let targetTotalAfterBase = currentTotal
  for (const p of patches) {
    const old = records.find(r => String(r.id) === p.id)
    if (!old) continue
    targetTotalAfterBase += p.newPeso - (Number(old.peso) || 0)
  }

  let diff = originalTotal - targetTotalAfterBase
  diff = round10(diff)

  if (diff !== 0) {
    const adjustable = patches.filter(p => {
      if (diff > 0) return p.newPeso < p.capMax - 10
      return p.newPeso > p.capMin + 10
    })

    let guard = 0
    while (diff !== 0 && adjustable.length > 0 && guard < 300000) {
      const p = adjustable[randomInt(0, adjustable.length - 1)]
      if (diff > 0) {
        if (p.newPeso + 10 <= p.capMax) {
          p.newPeso += 10
          p.newEntrada += 10
          diff -= 10
        }
      } else {
        if (p.newPeso - 10 >= p.capMin) {
          p.newPeso -= 10
          p.newEntrada -= 10
          diff += 10
        }
      }
      guard++
    }
  }

  const outOfRangeBefore = records.filter(r => {
    const rule = VEHICLE_BY_PLATE[r.placa_vehiculo as string]
    if (!rule) return false
    const rsu = Number(r.peso)
    return rsu < rule.capMin || rsu > rule.capMax
  }).length

  let horarioBefore = 0
  for (const r of records) {
    const mx = getMexicoDate(String(r.fecha_entrada))
    if (!isValidHorario(mx.getUTCDay(), getHourFraction(mx))) horarioBefore++
  }

  console.log(`📌 Registros a actualizar: ${patches.length}`)
  console.log(`   - Fuera de rango antes: ${outOfRangeBefore}`)
  console.log(`   - Fuera de horario antes: ${horarioBefore}`)

  for (const p of patches) {
    let payload: any = {
      peso: p.newPeso,
      peso_entrada: p.newEntrada,
      peso_salida: p.newSalida,
      updated_at: new Date().toISOString(),
    }

    if (p.needHorarioFix) {
      const fixed = moveToValidHorario(p.fechaEntrada, p.fechaSalida)
      payload = {
        ...payload,
        fecha_entrada: fixed.entrada,
        fecha_salida: fixed.salida,
      }
    }

    const { error: uerr } = await supabase
      .from('registros')
      .update(payload)
      .eq('id', p.id)

    if (uerr) {
      console.error('❌ Error updating', p.id, uerr)
      process.exit(1)
    }
  }

  const { data: after, error: afterErr } = await supabase
    .from('registros')
    .select('id, placa_vehiculo, peso, fecha_entrada, fecha_salida')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', START_DATE)
    .lt('fecha_entrada', END_DATE)

  if (afterErr || !after) {
    console.error('❌ Error fetching after:', afterErr)
    process.exit(1)
  }

  const finalTotal = round10(after.reduce((s, r) => s + (Number(r.peso) || 0), 0))

  let outOfRangeAfter = 0
  let horarioAfter = 0
  let durationAfter = 0

  for (const r of after) {
    const rule = VEHICLE_BY_PLATE[r.placa_vehiculo as string]
    if (rule) {
      const rsu = Number(r.peso)
      if (rsu < rule.capMin || rsu > rule.capMax) outOfRangeAfter++
    }

    const mx = getMexicoDate(String(r.fecha_entrada))
    if (!isValidHorario(mx.getUTCDay(), getHourFraction(mx))) horarioAfter++

    const durationMin = Math.round((new Date(String(r.fecha_salida)).getTime() - new Date(String(r.fecha_entrada)).getTime()) / 60000)
    if (durationMin < 10 || durationMin > 20) durationAfter++
  }

  console.log('✅ Fix aplicado')
  console.log(`   - Fuera de rango después: ${outOfRangeAfter}`)
  console.log(`   - Fuera de horario después: ${horarioAfter}`)
  console.log(`   - Duración fuera de 10-20 min después: ${durationAfter}`)
  console.log(`   - Total RSU antes: ${originalTotal} kg`)
  console.log(`   - Total RSU después: ${finalTotal} kg`)
}

run().catch((e) => {
  console.error('❌ Error fatal:', e)
  process.exit(1)
})
