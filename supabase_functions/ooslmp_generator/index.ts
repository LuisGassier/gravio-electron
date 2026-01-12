import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const CLAVE_EMPRESA = parseInt(Deno.env.get('CLAVE_EMPRESA') || '4', 10)
const COLLISION_BUFFER_MINUTES = parseInt(Deno.env.get('COLLISION_BUFFER_MINUTES') || '8', 10)
const TIMEZONE = Deno.env.get('TIMEZONE') || 'America/Mexico_City'
const ALLOW_BACKFILL = (Deno.env.get('ALLOW_BACKFILL') || 'false') === 'true'
const TARGET_MONTH_TOTAL_KG = parseInt(Deno.env.get('TARGET_MONTH_TOTAL_KG') || '2750000', 10)
const TARGET_MONTH_VARIATION = parseInt(Deno.env.get('TARGET_MONTH_VARIATION') || '250000', 10)
const TARGET_DAILY_COUNT_MEAN = parseInt(Deno.env.get('TARGET_DAILY_COUNT_MEAN') || '11', 10)
const MAX_DAILY_TOTAL = parseInt(Deno.env.get('MAX_DAILY_TOTAL') || '12', 10)
const DRY_RUN = (Deno.env.get('DRY_RUN') || 'true') === 'true'
const PHYSICAL_COOLDOWN_MINUTES = parseInt(Deno.env.get('PHYSICAL_COOLDOWN_MINUTES') || '30', 10)
const PHYSICAL_OVERRIDE_PROB = parseFloat(Deno.env.get('PHYSICAL_OVERRIDE_PROB') || '0.05')
const ACTIVITY_WINDOW_HOURS = parseInt(Deno.env.get('ACTIVITY_WINDOW_HOURS') || '4', 10)

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set; function won\'t run live')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
})

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

Deno.serve(async (req) => {
  try {
    const variation = Math.floor((Math.random() * 2 - 1) * TARGET_MONTH_VARIATION)
    const targetMonthKg = TARGET_MONTH_TOTAL_KG + variation

    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)

    // Calculate current waste for the month
    let kgActuales = 0
    const { data: registros } = await supabase
      .from('registros')
      .select('peso, peso_entrada, peso_salida')
      .eq('clave_empresa', CLAVE_EMPRESA)
      .gte('fecha_entrada', startOfMonth.toISOString())
      .lte('fecha_entrada', endOfMonth.toISOString())

    if (registros) {
      registros.forEach((r: any) => {
        const waste = r.peso || (r.peso_entrada && r.peso_salida ? r.peso_entrada - r.peso_salida : 0)
        kgActuales += waste || 0
      })
    }

    const kgFaltantes = Math.max(0, targetMonthKg - kgActuales)

    const daysRemaining = (() => {
      const tzToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      let count = 0
      for (let d = new Date(tzToday); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
        const day = d.getDay()
        if (day === 0) continue
        count++
      }
      return count || 1
    })()

    const expectedRecordsRemaining = Math.max(1, daysRemaining * TARGET_DAILY_COUNT_MEAN)
    const kgPerRecordTarget = kgFaltantes / expectedRecordsRemaining

    if (kgFaltantes <= 0) {
      return new Response(JSON.stringify({ ok: true, message: 'No hay kg faltantes en el mes' }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

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

    const pickRandom = (arr: any[]) => (arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null)
    const operador = pickRandom(operadores || [])
    const vehiculo = pickRandom(vehiculos || [])
    const ruta = pickRandom(rutas || [])
    const concepto = pickRandom(conceptos || [])

    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)
    const now = new Date()

    // Check for recent activity from ANY company (landfill is operating)
    const activityWindowStart = new Date(now.getTime() - ACTIVITY_WINDOW_HOURS * 60 * 60 * 1000)
    const { data: recentActivity } = await supabase
      .from('registros')
      .select('id, clave_empresa, fecha_entrada')
      .gte('fecha_entrada', activityWindowStart.toISOString())
      .lte('fecha_entrada', now.toISOString())
      .limit(1)

    if (!recentActivity || recentActivity.length === 0) {
      return new Response(JSON.stringify({ 
        ok: true, 
        message: `No hay actividad en el relleno en las últimas ${ACTIVITY_WINDOW_HOURS} horas - día sin trabajo`,
        activityWindowHours: ACTIVITY_WINDOW_HOURS
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get today's records for OOSLMP
    const { data: todaysRecords } = await supabase
      .from('registros')
      .select('id, fecha_entrada, registrado_por')
      .gte('fecha_entrada', startOfDay.toISOString())
      .lte('fecha_entrada', now.toISOString())
      .eq('clave_empresa', CLAVE_EMPRESA)

    const todaysPhysical = todaysRecords?.filter(r =>
      !r.registrado_por || !r.registrado_por.includes('SYSTEM_GENERATED_OOSLMP')
    ) || []
    const todaysVirtual = todaysRecords?.filter(r =>
      r.registrado_por && r.registrado_por.includes('SYSTEM_GENERATED_OOSLMP')
    ) || []

    const physicalCount = todaysPhysical.length
    const generatedCount = todaysVirtual.length
    const todaysCount = physicalCount + generatedCount

    let lastPhysicalTime: Date | null = null
    if (todaysPhysical.length) {
      const pd = todaysPhysical.map((r: any) => new Date(r.fecha_entrada))
      lastPhysicalTime = new Date(Math.max.apply(null, pd as any))
    }

    const allToday = todaysRecords || []
    let lastRegistroTime: Date | null = null
    if (allToday.length) {
      const dates = allToday.map((r: any) => new Date(r.fecha_entrada))
      lastRegistroTime = new Date(Math.max.apply(null, dates as any))
    }

    const dailyTarget = Math.min(MAX_DAILY_TOTAL, Math.round(sampleTruncatedNormal(TARGET_DAILY_COUNT_MEAN, 1, 10, 12)))
    const remainingToday = Math.max(0, dailyTarget - (physicalCount + generatedCount))

    const day = now.getDay()
    let minutesLeftInWindows = 0
    function minutesBetween(a: Date, b: Date) { return Math.max(0, Math.ceil((b.getTime() - a.getTime()) / 60000)) }

    // Monday-Saturday: 24 hours (00:00 - 23:59)
    // Sunday: Two windows (00:00-07:00 and 16:00-23:59)
    if (day === 0) {
      const window1End = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0, 0)
      const window2Start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0, 0)
      const window2End = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
      if (now < window1End) minutesLeftInWindows += minutesBetween(now, window1End)
      if (now < window2End) minutesLeftInWindows += minutesBetween(Math.max(now, window2Start), window2End)
    } else {
      // Monday-Saturday: Full day (00:00 - 23:59)
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
      minutesLeftInWindows = minutesBetween(now, endOfDay)
    }

    let shouldInsert = false
    if (remainingToday > 0 && minutesLeftInWindows > 0) {
      const expectedInterval = minutesLeftInWindows / remainingToday
      const minutesSinceLast = lastRegistroTime ? Math.ceil((now.getTime() - lastRegistroTime.getTime()) / 60000) : Infinity
      if (minutesSinceLast >= Math.max(1, expectedInterval * 0.6)) {
        shouldInsert = true
      } else {
        const prob = Math.min(0.3, 1 / Math.max(1, expectedInterval))
        if (Math.random() < prob) shouldInsert = true
      }
    }

    if (lastPhysicalTime) {
      const minutesSinceLastPhysical = Math.ceil((now.getTime() - lastPhysicalTime.getTime()) / 60000)
      if (minutesSinceLastPhysical < PHYSICAL_COOLDOWN_MINUTES) {
        if (Math.random() >= PHYSICAL_OVERRIDE_PROB) {
          return new Response(JSON.stringify({ ok: true, message: 'Skipping insertion due to recent physical registro', minutesSinceLastPhysical, PHYSICAL_COOLDOWN_MINUTES, dailyTarget, physicalCount, generatedCount }), {
            headers: { 'Content-Type': 'application/json' }
          })
        }
      }
    }

    if (!shouldInsert) {
      return new Response(JSON.stringify({ ok: true, message: 'Skipping insertion this run to preserve spacing', dailyTarget, physicalCount, generatedCount, remainingToday, minutesLeftInWindows }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const candidateTs = (() => {
      const day = today.getDay()
      let startHour = 0
      let endHour = 23

      // Sunday: Limited hours (00:00-07:00 or 16:00-23:00)
      if (day === 0) {
        if (Math.random() < 0.5) {
          startHour = 0
          endHour = 7
        } else {
          startHour = 16
          endHour = 23
        }
      }
      // Monday-Saturday: Full day (00:00-23:00)

      const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour
      const minute = Math.floor(Math.random() * 60)
      const ts = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute)
      return ts
    })()

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
      candidateTs.setTime(candidateTs.getTime() + bufferMs * 2)
    }

    const pesoSalida = Math.round(sampleTruncatedNormal(8800, 2000, 6600, 14600))
    // Generate waste (difference) between 9-13 tons, heavily biased towards 13 tons
    // This ensures all records stay within truck capacity constraint
    const waste = Math.round(sampleTruncatedNormal(12800, 300, 9000, 13000))
    const pesoEntrada = waste + pesoSalida
    const minutesDiff = Math.round(sampleTruncatedNormal(11, 4, 7, 15))
    const fechaSalida = new Date(candidateTs.getTime() + minutesDiff * 60 * 1000)
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
      generated_by_run_id: null as string | null,
    }

    const auditRow = {
      function_run_at: new Date().toISOString(),
      period: startOfMonth.toISOString(),
      registros_creados: 0,
      kg_generados: 0,
      notes: 'auto-generated run (dry-run mode: ' + DRY_RUN + ')',
    }

    if (DRY_RUN) {
      return new Response(JSON.stringify({ ok: true, dry_run: true, registro, kgFaltantes, kgPerRecordTarget }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { data: auditData, error: auditErr } = await supabase.from('generated_records_audit').insert(auditRow).select('*').limit(1)
    if (auditErr) {
      console.error('Error inserting audit row', auditErr)
      return new Response(JSON.stringify({ ok: false, error: auditErr }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    const runId = auditData && auditData[0] && auditData[0].id
    registro.generated_by_run_id = runId

    const { data: insertData, error: insertErr } = await supabase
      .from('registros')
      .insert(registro)
      .select('*')
      .limit(1)
    if (insertErr) {
      console.error('Error inserting registro', insertErr)
      await supabase.from('generated_records_audit').update({ notes: 'insert error: ' + String(insertErr) }).eq('id', runId)
      return new Response(JSON.stringify({ ok: false, error: insertErr }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    await supabase.from('generated_records_audit').update({ registros_creados: 1, kg_generados: waste }).eq('id', runId)

    return new Response(JSON.stringify({ ok: true, registro: insertData && insertData[0], runId }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('Unexpected error in ooslmp_generator', err)
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
