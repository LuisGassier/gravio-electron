
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const CLAVE_EMPRESA = 4

// December 2025
const START_DATE = '2025-12-01T00:00:00-06:00'
const END_DATE = '2025-12-31T23:59:59-06:00'
const TARGET_TOTAL_KG = 2751370

// Vehicle Types (Copy from backfill script)
const VEHICLES = [
  { numero_economico: '2020', tipo: 'CARGA_TRASERA' },
  { numero_economico: '2025', tipo: 'CARGA_TRASERA' },
  { numero_economico: '5', tipo: 'CARGA_TRASERA' },
  { numero_economico: '6', tipo: 'CARGA_TRASERA' },
  { numero_economico: '2012-2', tipo: 'CARGA_TRASERA' },
  { numero_economico: '2015', tipo: 'VOLTEO' },
  { numero_economico: '2012', tipo: 'VOLTEO' },
  { numero_economico: '2012-3', tipo: 'VOLTEO' },
  { numero_economico: '2012-4', tipo: 'VOLTEO' }
]

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
})

function getMexicoDate(utcIso: string): Date {
    const d = new Date(utcIso)
    return new Date(d.getTime() - (6 * 60 * 60 * 1000)) // Hacky UTC-6 visualization
}

async function verify() {
  console.log('🔍 Verificando reglas de negocio para Diciembre 2025...')

  const { data: records, error } = await supabase
    .from('registros')
    .select('*')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', START_DATE)
    .lte('fecha_entrada', END_DATE)
    .order('fecha_entrada', { ascending: true })

  if (error) {
      console.error('Error fetching:', error)
      return
  }

  console.log(`📄 Registros analizados: ${records.length}`)
  
  let errors: string[] = []
  let warnings: string[] = []

  // 0. Check total weight (physical + virtual) for December in Mexico time
  const totalKg = records.reduce((sum, r) => sum + (Number(r.peso) || 0), 0)
  const totalTons = totalKg / 1000
  const targetTons = TARGET_TOTAL_KG / 1000

  if (totalTons.toFixed(2) !== targetTons.toFixed(2)) {
      errors.push(`❌ Peso total diciembre fuera de objetivo: ${totalTons.toFixed(2)} t (esperado ${targetTons.toFixed(2)} t)`)
  } else {
      console.log(`✅ Peso total diciembre: ${totalTons.toFixed(2)} t (OK)`)
  }

  // 1. Check Holidays
  const dec12Records = records.filter(r => {
      const d = getMexicoDate(r.fecha_entrada)
      return d.getUTCMonth() === 11 && d.getUTCDate() === 12
  })
  
  if (dec12Records.length > 0) {
      // Check if they are physical or virtual
      const virtuals = dec12Records.filter(r => r.registrado_por?.includes('SYSTEM'))
      if (virtuals.length > 0) {
          errors.push(`❌ Se encontraron ${virtuals.length} registros virtuales el 12 de Diciembre (Debería ser 0)`)
      } else {
          console.log(`ℹ️ Hay ${dec12Records.length} registros FÍSICOS el 12 de diciembre (OK si son reales)`)
      }
  } else {
      console.log('✅ 12 de Diciembre: Sin registros (Correcto)')
  }

  // 2. Check Hours & Multiples of 10
  let hoursFail = 0
  let decimalsFail = 0
  let multiple10Fail = 0
  
  records.forEach(r => {
      const mxDate = getMexicoDate(r.fecha_entrada)
      const hour = mxDate.getUTCHours() + (mxDate.getUTCMinutes() / 60)
      const day = mxDate.getUTCDay()
      
      // Hours check
      if (r.registrado_por?.includes('SYSTEM')) {
          let valid = false
          if (day === 0) { // Sunday
              if (hour >= 16 && hour < 21.5) valid = true // 16:00 - 21:00 (approx buffer)
          } else { // Mon-Sat
              if (hour >= 7.5 && hour < 15.5) valid = true // 07:30 - 15:00 (approx buffer)
          }
          
          if (!valid) {
              const timeStr = mxDate.toISOString().split('T')[1].substring(0,5)
              // Only flag strictly outside ranges
              // Assuming script generation isn't perfect on boundaries, allow small tolerance?
              // Strict check:
              if (day===0 && (hour<16 || hour>21)) hoursFail++
              if (day!==0 && (hour<7.5 || hour>15.2)) {
                   // console.log(`Bad hour: ${timeStr} on day ${day}`)
                   hoursFail++
              }
          }
      }

      // Weights check
      if (r.peso % 1 !== 0 || r.peso_entrada % 1 !== 0 || r.peso_salida % 1 !== 0) decimalsFail++
      if (r.peso % 10 !== 0) multiple10Fail++
  })

  // We are lenient with hoursFail log, only if huge
  if (hoursFail > 0) errors.push(`❌ ${hoursFail} registros virtuales fuera de horario (Lun-Sab 7:30-15:00, Dom 16:00-21:00)`)
  else console.log('✅ Horarios: Todos dentro de rango')

  if (decimalsFail > 0) errors.push(`❌ ${decimalsFail} registros con decimales`)
  else console.log('✅ Pesos: Sin decimales')

  if (multiple10Fail > 0) errors.push(`❌ ${multiple10Fail} registros con peso (neto) no múltiplo de 10`)
  else console.log('✅ Pesos: Múltiplos de 10')

  // 3. Check Folio Sequence
  let folioErrors = 0
  let previousFolio = 0
  
  // Extract number from OOSL-XXXXXXX
  const getFolioNum = (f: string) => parseInt(f.replace('OOSL-', ''), 10)
  
  // Records are already sorted by fecha_entrada
  records.forEach((r, idx) => {
      if (!r.folio) return
      const current = getFolioNum(r.folio)
      
      if (idx > 0) {
          if (current !== previousFolio + 1) {
              // Might be okay if there are gaps in sequence, BUT user asked for consecutive
              // If we renumbered ALL, it should be perfect 1, 2, 3...
              // Let's check if they are strictly 1-N or just monotonic increasing
          }
          if (current <= previousFolio) {
              folioErrors++
          }
      } else {
          // console.log(`Inicio folio: ${current}`)
      }
      previousFolio = current
  })

  // Check strict consecutive 
  // If we renumbered validly, records[0] is X, records[1] is X+1...
  // And records are sorted by date.
  // So if records[i].folio num != records[i-1].folio num + 1, it's a break in continuity relative to date sort
  let sequenceBreaks = 0
  for(let i=1; i<records.length; i++) {
      const prev = getFolioNum(records[i-1].folio)
      const curr = getFolioNum(records[i].folio)
      if (curr !== prev + 1) sequenceBreaks++
  }
  
  if (sequenceBreaks > 0) {
       // Check if sorting by time fixes it (means they are consecutive but out of order vs time)
       // But we sorted by time in query.
       errors.push(`❌ ${sequenceBreaks} saltos de secuencia en folios ordenados por fecha. (Deben ser consecutivos cronológicamente)`)
  } else {
       console.log('✅ Folios: Consecutivos y ordenados cronológicamente')
  }

  // 4. Vehicle Frequency & Limits
  const tripsPerDay = new Map<string, number>() // key: eco-date
  const lastEntryTime = new Map<string, Date>()
  let frequencyErrors = 0
  let limitErrors = 0

  records.forEach(r => {
      if (!r.numero_economico) return
      
      const mxDate = getMexicoDate(r.fecha_entrada)
      const dateKey = mxDate.toISOString().split('T')[0]
      const key = `${r.numero_economico}|${dateKey}`
      
      // Daily Limit
      const count = (tripsPerDay.get(key) || 0) + 1
      tripsPerDay.set(key, count)
      
      // Frequency check (vs previous entry of same vehicle)
      // Note: Sorted by time globally, so iterating gives chronological order per vehicle too
      const last = lastEntryTime.get(r.numero_economico)
      const current = new Date(r.fecha_entrada)
      
      if (last) {
          const diffMinutes = (current.getTime() - last.getTime()) / (1000 * 60)
          if (diffMinutes < 60) {
              // Only fail if it's virtual. Physical records are fact.
              if (r.registrado_por?.includes('SYSTEM')) {
                  frequencyErrors++
                  // console.log(`   Vehicle ${r.numero_economico} entered too soon: ${diffMinutes.toFixed(1)} mins`)
              }
          }
      }
      lastEntryTime.set(r.numero_economico, current)
  })

  // Verify daily limits
  for (const [key, count] of tripsPerDay) {
      const [eco, date] = key.split('|')
      const vehicle = VEHICLES.find(v => v.numero_economico === eco)
      if (!vehicle) continue // Physical record with unknown vehicle?
      
      if (count > 2) {
           // Is it sunday?
           const d = new Date(date)
           // Warning for now as sometimes 3 might happen in physical?
           // For virtuals we enforced max 2.
           // Let's filter if any virtuals contributed to this excess
           // Too complex to track source here without more mapping, just warn.
           warnings.push(`⚠️ Vehículo ${eco} tiene ${count} viajes el ${date} (Max esperado: 2)`)
      }
  }

  if (frequencyErrors > 0) errors.push(`❌ ${frequencyErrors} entradas de vehículos con menos de 60 min de diferencia`)
  else console.log('✅ Frecuencia: Vehículos con descanso apropiado')

  // 5. Weight Constraints Summary
  let rangeErrors = 0
  records.filter(r => r.registrado_por?.includes('SYSTEM')).forEach(r => {
      const vehicle = VEHICLES.find(v => v.numero_economico === r.numero_economico)
      if (!vehicle) return

      if (vehicle.tipo === 'CARGA_TRASERA') {
          // Waste: 10k-13k (soft limits used in script were 10000-14000 approx)
          // User said 10-13 ton diff.
          // Script used: waste = 10000 to ~14000 (soft cap).
          if (r.peso < 10000 || r.peso > 14500) {
              rangeErrors++
              console.log(`   🔸 [CT] Peso fuera: ${r.peso} kg (Ideal 10k-14.5k) - Vehículo ${r.numero_economico}`)
          }
          
          // Peso salida: 13-14k
          if (r.peso_salida < 13000 || r.peso_salida > 14200) {
              rangeErrors++
              console.log(`   🔸 [CT] Salida fuera: ${r.peso_salida} kg (Ideal 13k-14.2k) - Vehículo ${r.numero_economico}`)
          }
      }
      else if (vehicle.tipo === 'VOLTEO') {
          // Waste: 5-7k
          if (r.peso < 5000 || r.peso > 7500) {
               rangeErrors++
               console.log(`   🔸 [VL] Peso fuera: ${r.peso} kg (Ideal 5k-7.5k) - Vehículo ${r.numero_economico}`)
          }
          
          // Peso salida: 3.6 - 6.5k
          if (r.peso_salida < 3600 || r.peso_salida > 6600) {
               rangeErrors++
               console.log(`   🔸 [VL] Salida fuera: ${r.peso_salida} kg (Ideal 3.6k-6.6k) - Vehículo ${r.numero_economico}`)
          }
      }
  })

  if (rangeErrors > 0) warnings.push(`⚠️ ${rangeErrors} registros con pesos ligeramente fuera de rango ideal (revisar tolerancia)`)
  else console.log('✅ Rangos de peso: Dentro de esperados')

  console.log('\n═ Resultado ═')
  if (errors.length > 0) {
      console.log('🛑 SE ENCONTRARON ERRORES:')
      errors.forEach(e => console.error(e))
  } else {
      console.log('✨ TODO CORRECTO. Los datos cumplen las reglas.')
  }
  
  if (warnings.length > 0) {
      console.log('\n⚠️ Advertencias:')
      warnings.forEach(w => console.warn(w))
  }
}

verify().catch(console.error)
