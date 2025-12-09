import { createClient } from '@supabase/supabase-js'

// Edge Function / Supabase function scaffold
// Requiere en el entorno: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Configurables mediante env: CLAVE_EMPRESA, COLLISION_BUFFER_MINUTES, TIMEZONE, ALLOW_BACKFILL, TARGET_MONTH_TOTAL_KG, TARGET_DAILY_COUNT_MEAN, DRY_RUN

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const CLAVE_EMPRESA = parseInt(process.env.CLAVE_EMPRESA || '4', 10)
const COLLISION_BUFFER_MINUTES = parseInt(process.env.COLLISION_BUFFER_MINUTES || '8', 10)
const TIMEZONE = process.env.TIMEZONE || 'America/Mexico_City'
const ALLOW_BACKFILL = (process.env.ALLOW_BACKFILL || 'false') === 'true'
const TARGET_MONTH_TOTAL_KG = parseInt(process.env.TARGET_MONTH_TOTAL_KG || '380000', 10)
const TARGET_MONTH_VARIATION = parseInt(process.env.TARGET_MONTH_VARIATION || '10000', 10)
const TARGET_DAILY_COUNT_MEAN = parseInt(process.env.TARGET_DAILY_COUNT_MEAN || '10', 10)
const DRY_RUN = (process.env.DRY_RUN || 'true') === 'true'

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set; function won\'t run live')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
  },
})

// Utility: truncated normal via simple rejection sampling
function sampleTruncatedNormal(mean: number, std: number, min: number, max: number) {
  for (let i = 0; i < 100; i++) {
    const u1 = Math.random()
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    const v = mean + z * std
    if (v >= min && v <= max) return v
  }
  return Math.max(min, Math.min(max, mean))
}

// Helper: format UTC timestamp candidate using local timezone offsets if needed
function nowLocal(date = new Date()) {
  return new Date(date.toISOString())
}

export default async function handler(req: any, res: any) {
  try {
    // Determine target for the month with small random variation
    const variation = Math.floor((Math.random() * 2 - 1) * TARGET_MONTH_VARIATION)
    const targetMonthKg = TARGET_MONTH_TOTAL_KG + variation

    // Get current date in server timezone (we treat as local for scheduling purposes)
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)

    // 1) sumar kg actuales del mes para la empresa
    const { data: sumData, error: sumError } = await supabase
      .rpc('sum_registros_peso_by_empresa', { p_clave_empresa: CLAVE_EMPRESA, p_start: startOfMonth.toISOString(), p_end: endOfMonth.toISOString() })

    // Note: si no tienes el RPC `sum_registros_peso_by_empresa`, abajo incluyo la SQL equivalente como comentario
    // SQL equivalente (ejecutar como query si RPC no existe):
    // SELECT COALESCE(SUM(COALESCE(peso_entrada, peso_salida, peso, 0)),0)::numeric as total_kg
    // FROM public.registros
    // WHERE clave_empresa = $1 AND fecha_entrada BETWEEN $2 AND $3

    let kgActuales = 0
    if (sumError) {
      console.warn('RPC sum_registros_peso_by_empresa no disponible o falló; intentando consulta directa', sumError)
      const q = `SELECT COALESCE(SUM(COALESCE(peso_entrada, peso_salida, peso, 0)),0) as total_kg FROM public.registros WHERE clave_empresa = $1 AND fecha_entrada BETWEEN $2 AND $3`
      const raw = await supabase.rpc('sql_query', { query: q, params: [CLAVE_EMPRESA, startOfMonth.toISOString(), endOfMonth.toISOString()] })
      // Si no hay helper, seguiremos con kgActuales = 0 y trabajaremos en dry-run
    } else {
      // supabase-js devuelve data con la suma si RPC existe
      // Ajuste: depende de la implementación del RPC
      // Aquí asumimos que sumData[0].total_kg contiene la suma
      if (sumData && Array.isArray(sumData) && sumData.length > 0) {
        // @ts-ignore
        kgActuales = Number(sumData[0].total_kg || 0)
      }
    }

    // 2) calcular kg faltantes
    const kgFaltantes = Math.max(0, targetMonthKg - kgActuales)

    // 3) calcular días y registros restantes
    // simplificación: días hábiles restantes = días entre hoy y fin de mes excluyendo domingos en que no hay pesaje completo
    const daysRemaining = (() => {
      const tzToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      let count = 0
      for (let d = new Date(tzToday); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
        const day = d.getDay() // 0 = domingo
        if (day === 0) continue // skip sunday because there's partial window
        count++
      }
      return count || 1
    })()

    const expectedRecordsRemaining = Math.max(1, daysRemaining * TARGET_DAILY_COUNT_MEAN)

    const kgPerRecordTarget = kgFaltantes / expectedRecordsRemaining

    // Decide whether generate now: if kgFaltantes <= 0 return
    if (kgFaltantes <= 0) {
      return res.json({ ok: true, message: 'No hay kg faltantes en el mes' })
    }

    // Preparar listas de operadores, rutas, conceptos y vehiculos para clave_empresa
    const [{ data: operadores }, { data: vehiculos }, { data: rutas }, { data: conceptos }] = await Promise.all([
      supabase
        .from('operadores')
        .select('id, operador, clave_operador')
        .in('id', supabase
          .from('operadores_empresas')
          .select('operador_id')
          .eq('clave_empresa', CLAVE_EMPRESA)
          .then((r: any) => r.data?.map((x: any) => x.operador_id) || [])),
      supabase.from('vehiculos').select('id, no_economico, placas, clave_empresa').eq('clave_empresa', CLAVE_EMPRESA),
      supabase.from('rutas').select('id, ruta, clave_ruta, clave_empresa').eq('clave_empresa', CLAVE_EMPRESA),
      supabase.from('conceptos').select('id, nombre, clave_concepto').limit(100)
        .in('id', supabase.from('conceptos_empresas').select('concepto_id').eq('clave_empresa', CLAVE_EMPRESA).then((r: any) => r.data?.map((x: any) => x.concepto_id) || [])),
    ]).catch((e) => {
      console.warn('Warning: error fetching catalogues', e)
      return [{ data: [] }, { data: [] }, { data: [] }, { data: [] }]
    })

    // Select random items with fallback
    const pickRandom = (arr: any[]) => (arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null)
    const operador = pickRandom(operadores || [])
    const vehiculo = pickRandom(vehiculos?.data || [])
    const ruta = pickRandom(rutas?.data || [])
    const concepto = pickRandom(conceptos?.data || [])

    // Decide whether to insert now based on spacing and daily targets
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)
    const now = new Date()

    // count registros for today for this company and find last timestamp
    const { data: todaysRegs } = await supabase
      .from('registros')
      .select('id, fecha_entrada')
      .gte('fecha_entrada', startOfDay.toISOString())
      .lte('fecha_entrada', now.toISOString())
      .eq('clave_empresa', CLAVE_EMPRESA)

    const todaysCount = (todaysRegs && Array.isArray(todaysRegs)) ? todaysRegs.length : 0
    let lastRegistroTime: Date | null = null
    if (todaysRegs && todaysRegs.length) {
      const dates = todaysRegs.map((r: any) => new Date(r.fecha_entrada))
      lastRegistroTime = new Date(Math.max.apply(null, dates as any))
    }

    // Determine target daily count (randomized within 9-11 but consistent per run)
    const dailyTarget = Math.max(9, Math.min(11, Math.round(sampleTruncatedNormal(TARGET_DAILY_COUNT_MEAN, 1, 9, 11))))
    const remainingToday = Math.max(0, dailyTarget - todaysCount)

    // compute remaining allowed minutes in today's windows
    const day = now.getDay()
    const weekdayStartHour = 7
    const weekdayEndHour = 17
    let minutesLeftInWindows = 0
    function minutesBetween(a: Date, b: Date) { return Math.max(0, Math.ceil((b.getTime() - a.getTime()) / 60000)) }

    if (day === 0) {
      // sunday: allowed windows are 00:00-07:00 and 16:00-23:59
      const window1End = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0, 0)
      const window2Start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0, 0)
      const window2End = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
      if (now < window1End) minutesLeftInWindows += minutesBetween(now, window1End)
      if (now < window2End) minutesLeftInWindows += minutesBetween(Math.max(now, window2Start), window2End)
    } else {
      const windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), weekdayStartHour, 0, 0)
      const windowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), weekdayEndHour, 0, 0)
      if (now < windowEnd) minutesLeftInWindows += minutesBetween(Math.max(now, windowStart), windowEnd)
    }

    // Decide insertion based on remaining slots and spacing
    let shouldInsert = false
    if (remainingToday > 0 && minutesLeftInWindows > 0) {
      const expectedInterval = minutesLeftInWindows / remainingToday
      const minutesSinceLast = lastRegistroTime ? Math.ceil((now.getTime() - lastRegistroTime.getTime()) / 60000) : Infinity
      // Allow insert if we're close to the expected interval since last registro, or small random chance
      if (minutesSinceLast >= Math.max(1, expectedInterval * 0.6)) {
        shouldInsert = true
      } else {
        // small probabilistic allowance to avoid rigid schedule
        const prob = Math.min(0.3, 1 / Math.max(1, expectedInterval))
        if (Math.random() < prob) shouldInsert = true
      }
    }

    if (!shouldInsert) {
      return res.json({ ok: true, message: 'Skipping insertion this run to preserve spacing', dailyTarget, todaysCount, remainingToday, minutesLeftInWindows })
    }

    // Timestamp candidate: choose within today avoiding sunday 07:00-16:00
    const candidateTs = (() => {
      const day = today.getDay()
      let startHour = 7
      let endHour = 17
      if (day === 0) {
        // sunday: no pesajes between 07:00-16:00: we choose outside that window (early morning or after 16:00)
        // choose randomly either before 07:00 or after 16:00
        if (Math.random() < 0.5) {
          startHour = 0
          endHour = 7
        } else {
          startHour = 16
          endHour = 23
        }
      }
      const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour
      const minute = Math.floor(Math.random() * 60)
      const ts = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute)
      return ts
    })()

    // Collision check
    const bufferMs = COLLISION_BUFFER_MINUTES * 60 * 1000
    const tsStart = new Date(candidateTs.getTime() - bufferMs)
    const tsEnd = new Date(candidateTs.getTime() + bufferMs)

    const { data: collisions, error: collErr } = await supabase
      .from('registros')
      .select('id, fecha_entrada, clave_empresa')
      .gte('fecha_entrada', tsStart.toISOString())
      .lte('fecha_entrada', tsEnd.toISOString())
      .limit(1)

    if (collErr) {
      console.warn('Error checking collisions', collErr)
    }

    if (collisions && collisions.length) {
      // collision detected: try to shift timestamp by buffer*2 forward
      candidateTs.setTime(candidateTs.getTime() + bufferMs * 2)
    }

    // Generate weight using truncated normal around kgPerRecordTarget
    const mean = Math.max(kgPerRecordTarget, 500) // fallback min 500kg
    const std = Math.max(mean * 0.15, 50)
    const weight = Math.round(sampleTruncatedNormal(mean, std, Math.max(200, mean * 0.5), mean * 2))

    const registro = {
      clave_empresa: CLAVE_EMPRESA,
      tipo_pesaje: 'entrada',
      peso_entrada: weight,
      fecha_entrada: candidateTs.toISOString(),
      registrado_por: 'SYSTEM_GENERATED_OOSLMP',
      sincronizado: false,
      operador: operador?.operador || null,
      clave_operador: operador?.clave_operador || null,
      numero_economico: vehiculo?.no_economico || null,
      placa_vehiculo: vehiculo?.placas || null,
      ruta: ruta?.ruta || null,
      clave_ruta: ruta?.clave_ruta || null,
      clave_concepto: concepto?.clave_concepto || null,
      concepto_id: concepto?.id || null,
      folio: null,
    }

    // Insert audit row first to get run_id
    const auditRow = {
      function_run_at: new Date().toISOString(),
      period: startOfMonth.toISOString(),
      registros_creados: 0,
      kg_generados: 0,
      notes: 'auto-generated run (dry-run mode: ' + DRY_RUN + ')',
    }

    if (DRY_RUN) {
      return res.json({ ok: true, dry_run: true, registro, kgFaltantes, kgPerRecordTarget })
    }

    // Insert audit and registration (best-effort transactional behavior)
    const { data: auditData, error: auditErr } = await supabase.from('generated_records_audit').insert(auditRow).select('*').limit(1)
    if (auditErr) {
      console.error('Error inserting audit row', auditErr)
      return res.status(500).json({ ok: false, error: auditErr })
    }
    const runId = auditData && auditData[0] && auditData[0].id

    // attach run id to registro
    // @ts-ignore
    registro.generated_by_run_id = runId

    const { data: insertData, error: insertErr } = await supabase.from('registros').insert(registro).select('*').limit(1)
    if (insertErr) {
      console.error('Error inserting registro', insertErr)
      // attempt to mark audit with error note
      await supabase.from('generated_records_audit').update({ notes: 'insert error: ' + String(insertErr) }).eq('id', runId)
      return res.status(500).json({ ok: false, error: insertErr })
    }

    // update audit with created info
    await supabase.from('generated_records_audit').update({ registros_creados: 1, kg_generados: weight }).eq('id', runId)

    return res.json({ ok: true, registro: insertData && insertData[0], runId })
  } catch (err) {
    console.error('Unexpected error in ooslmp_generator', err)
    return res.status(500).json({ ok: false, error: String(err) })
  }
}
