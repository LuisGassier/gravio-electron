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
const PHYSICAL_COOLDOWN_MINUTES = parseInt(process.env.PHYSICAL_COOLDOWN_MINUTES || '30', 10)
const PHYSICAL_OVERRIDE_PROB = parseFloat(process.env.PHYSICAL_OVERRIDE_PROB || '0.05')

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
    // Query registros table and filter by registrado_por to differentiate physical vs virtual
    const { data: todaysRecords } = await supabase
      .from('registros')
      .select('id, fecha_entrada, registrado_por')
      .gte('fecha_entrada', startOfDay.toISOString())
      .lte('fecha_entrada', now.toISOString())
      .eq('clave_empresa', CLAVE_EMPRESA)

    // Separate physical and virtual records based on registrado_por marker
    const todaysPhysical = todaysRecords?.filter(r =>
      !r.registrado_por || !r.registrado_por.includes('SYSTEM_GENERATED_OOSLMP')
    ) || []
    const todaysVirtual = todaysRecords?.filter(r =>
      r.registrado_por && r.registrado_por.includes('SYSTEM_GENERATED_OOSLMP')
    ) || []

    const physicalCount = todaysPhysical.length
    const generatedCount = todaysVirtual.length
    const todaysCount = physicalCount + generatedCount

    // Compute last physical registro time (only from physical records)
    let lastPhysicalTime: Date | null = null
    if (todaysPhysical.length) {
      const pd = todaysPhysical.map((r: any) => new Date(r.fecha_entrada))
      lastPhysicalTime = new Date(Math.max.apply(null, pd as any))
    }

    // Compute last registro time considering BOTH physical and virtual (for spacing)
    const allToday = todaysRecords || []
    let lastRegistroTime: Date | null = null
    if (allToday.length) {
      const dates = allToday.map((r: any) => new Date(r.fecha_entrada))
      lastRegistroTime = new Date(Math.max.apply(null, dates as any))
    }

    // Determine target daily count (randomized within 9-11 but consistent per run)
    const dailyTarget = Math.max(9, Math.min(11, Math.round(sampleTruncatedNormal(TARGET_DAILY_COUNT_MEAN, 1, 9, 11))))
    // Remaining slots consider both physical and generated records: target is for the total daily count
    const remainingToday = Math.max(0, dailyTarget - (physicalCount + generatedCount))

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

    // PRIORITY: avoid generating if a physical registro happened recently within cooldown window
    if (lastPhysicalTime) {
      const minutesSinceLastPhysical = Math.ceil((now.getTime() - lastPhysicalTime.getTime()) / 60000)
      if (minutesSinceLastPhysical < PHYSICAL_COOLDOWN_MINUTES) {
        // allow rare override with small probability
        if (Math.random() >= PHYSICAL_OVERRIDE_PROB) {
          return res.json({ ok: true, message: 'Skipping insertion due to recent physical registro', minutesSinceLastPhysical, PHYSICAL_COOLDOWN_MINUTES, dailyTarget, physicalCount, generatedCount })
        }
      }
    }

    if (!shouldInsert) {
      return res.json({ ok: true, message: 'Skipping insertion this run to preserve spacing', dailyTarget, physicalCount, generatedCount, remainingToday, minutesLeftInWindows })
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

    // Collision check - verify against all records in registros table
    const bufferMs = COLLISION_BUFFER_MINUTES * 60 * 1000
    const tsStart = new Date(candidateTs.getTime() - bufferMs)
    const tsEnd = new Date(candidateTs.getTime() + bufferMs)

    const { data: collisions } = await supabase
      .from('registros')
      .select('id, fecha_entrada')
      .gte('fecha_entrada', tsStart.toISOString())
      .lte('fecha_entrada', tsEnd.toISOString())
      .eq('clave_empresa', CLAVE_EMPRESA)
      .limit(1)

    if (collisions && collisions.length > 0) {
      // collision detected: try to shift timestamp by buffer*2 forward
      candidateTs.setTime(candidateTs.getTime() + bufferMs * 2)
    }

    // Generate peso_salida (empty truck weight) based on real data
    // Real data: min=6,630 kg, max=14,650 kg, avg=8,789 kg, median=6,890 kg
    const pesoSalida = Math.round(sampleTruncatedNormal(8800, 2000, 6600, 14600))

    // Generate waste (difference) using kgPerRecordTarget
    const wasteMean = Math.max(kgPerRecordTarget, 5000) // fallback min 5 tons
    const wasteStd = Math.max(wasteMean * 0.1, 500)
    const waste = Math.round(sampleTruncatedNormal(wasteMean, wasteStd, Math.max(5000, wasteMean * 0.8), wasteMean * 1.2))

    // Calculate entrada weight (truck arrives full)
    const pesoEntrada = waste + pesoSalida

    // Generate exit time: 11 minutes ± 4 minutes after entry
    const minutesDiff = Math.round(sampleTruncatedNormal(11, 4, 7, 15))
    const fechaSalida = new Date(candidateTs.getTime() + minutesDiff * 60 * 1000)

    // created_at should be ~2-3 seconds before fecha_entrada
    const createdAt = new Date(candidateTs.getTime() - (2000 + Math.random() * 1000))

    const registro = {
      clave_empresa: CLAVE_EMPRESA,
      tipo_pesaje: 'entrada',
      peso: waste,
      peso_entrada: pesoEntrada,
      peso_salida: pesoSalida,
      fecha_entrada: candidateTs.toISOString(),
      fecha_salida: fechaSalida.toISOString(),
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
      registrado_por: 'SYSTEM_GENERATED_OOSLMP',
      operador: operador?.operador || null,
      clave_operador: operador?.clave_operador || null,
      numero_economico: vehiculo?.no_economico || null,
      placa_vehiculo: vehiculo?.placas || 'VIRTUAL-PLACEHOLDER',
      ruta: ruta?.ruta || null,
      clave_ruta: ruta?.clave_ruta || null,
      clave_concepto: concepto?.clave_concepto || null,
      concepto_id: concepto?.id || null,
      folio: null,
      sincronizado: true,
      generated_by_run_id: null as string | null, // Will be set after audit insert
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
    registro.generated_by_run_id = runId

    // Insert into registros table (marked as virtual via registrado_por field)
    const { data: insertData, error: insertErr } = await supabase
      .from('registros')
      .insert(registro)
      .select('*')
      .limit(1)
    if (insertErr) {
      console.error('Error inserting registro', insertErr)
      // attempt to mark audit with error note
      await supabase.from('generated_records_audit').update({ notes: 'insert error: ' + String(insertErr) }).eq('id', runId)
      return res.status(500).json({ ok: false, error: insertErr })
    }

    // update audit with created info
    await supabase.from('generated_records_audit').update({ registros_creados: 1, kg_generados: waste }).eq('id', runId)

    return res.json({ ok: true, registro: insertData && insertData[0], runId })
  } catch (err) {
    console.error('Unexpected error in ooslmp_generator', err)
    return res.status(500).json({ ok: false, error: String(err) })
  }
}
