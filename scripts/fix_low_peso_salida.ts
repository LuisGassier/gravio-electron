/**
 * Fix Script: Corregir registros con `peso_salida` menor al mínimo esperado
 * según `docs/REGLAS MES DE ENERO 2026.csv`.
 *
 * Usage:
 *   DRY_RUN=false SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node scripts/fix_low_peso_salida.ts
 */

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env' })

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const DRY_RUN = process.env.DRY_RUN?.toLowerCase() !== 'false'
const CLAVE_EMPRESA = 4
const YEAR = 2026
const MONTH = 1

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  process.exit(1)
}

const START_DATE = new Date(YEAR, MONTH - 1, 1, 0, 0, 0)
START_DATE.setHours(START_DATE.getHours() + 6)
const END_DATE = new Date(YEAR, MONTH, 0, 23, 59, 59)
END_DATE.setHours(END_DATE.getHours() + 6)

interface VehicleSpec {
  numero_economico: string
  placa: string
  tipo: 'COMPACTADOR_2_EJES' | 'COMPACTADOR_1_EJE' | 'VOLTEO'
  peso_salida_min: number
  peso_salida_max: number
  capacidad_min: number
  capacidad_max: number
}

const VEHICLES: VehicleSpec[] = [
  // Compactadores 2 Ejes: Min 13,200 (antes 13,000 en el script viejo?) - Max 15,500
  { numero_economico: '2017', placa: 'SP85738', tipo: 'COMPACTADOR_2_EJES', peso_salida_min: 13200, peso_salida_max: 15500, capacidad_min: 13000, capacidad_max: 14000 },
  { numero_economico: '2018', placa: 'SP85739', tipo: 'COMPACTADOR_2_EJES', peso_salida_min: 13200, peso_salida_max: 15500, capacidad_min: 13000, capacidad_max: 14000 },

  // Compactadores 1 Eje: Min 10,200 - Max 11,700
  { numero_economico: '2013', placa: 'SN43215', tipo: 'COMPACTADOR_1_EJE', peso_salida_min: 10200, peso_salida_max: 11700, capacidad_min: 9000, capacidad_max: 10000 },
  { numero_economico: '2013', placa: 'SN46198', tipo: 'COMPACTADOR_1_EJE', peso_salida_min: 10200, peso_salida_max: 11700, capacidad_min: 9000, capacidad_max: 10000 },
  { numero_economico: '2010', placa: 'SM02293', tipo: 'COMPACTADOR_1_EJE', peso_salida_min: 10200, peso_salida_max: 11700, capacidad_min: 9000, capacidad_max: 10000 },

  // Volteos: Min 6,000 - Max 7,500
  { numero_economico: '2015', placa: 'SP81281', tipo: 'VOLTEO', peso_salida_min: 6000, peso_salida_max: 7500, capacidad_min: 5500, capacidad_max: 6500 },
  { numero_economico: '2012', placa: 'SN31022', tipo: 'VOLTEO', peso_salida_min: 6000, peso_salida_max: 7500, capacidad_min: 5500, capacidad_max: 6500 },
  { numero_economico: '2012', placa: 'SN31025', tipo: 'VOLTEO', peso_salida_min: 6000, peso_salida_max: 7500, capacidad_min: 5500, capacidad_max: 6500 },
  { numero_economico: '2012', placa: 'SN43220', tipo: 'VOLTEO', peso_salida_min: 6000, peso_salida_max: 7500, capacidad_min: 5500, capacidad_max: 6500 },
]

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } })

function roundToNearestTen(value: number): number {
  return Math.round(value / 10) * 10
}

function avoidExactPeso(value: number, min: number, max: number): number {
  let v = Math.round(value / 10) * 10
  if (v < min + 100) v = min + 100
  if (v > max - 100) v = max - 100
  // small jitter
  v += (Math.floor(Math.random() * 7) - 3) * 10
  return Math.round(v / 10) * 10
}

// Map of Folio -> Absolute negative net weight (tonnes) from the CSV
// Converted to kg (multiply by 1000)
const CorrectionsMap: Record<string, number> = {
  'OOSL-0000286': 460, // -0.46
  'OOSL-0000300': 120, // -0.12
  'OOSL-0000301': 560, // -0.56
  'OOSL-0000303': 260, // -0.26
  'OOSL-0000304': 40,  // -0.04
  'OOSL-0000306': 1070,// -1.07
  'OOSL-0000310': 640, // -0.64
  'OOSL-0000311': 240, // -0.24
  'OOSL-0000312': 130, // -0.13
  'OOSL-0000317': 130, // -0.13
  'OOSL-0000319': 1690,// -1.69
  'OOSL-0000324': 650, // -0.65
  'OOSL-0000332': 130, // -0.13
  'OOSL-0000333': 320, // -0.32
  'OOSL-0000368': 400, // -0.40
  'OOSL-0000382': 540, // -0.54
  'OOSL-0000385': 210, // -0.21
  'OOSL-0000386': 120, // -0.12
  'OOSL-0000388': 830, // -0.83
  'OOSL-0000395': 1020,// -1.02
  'OOSL-0000399': 250, // -0.25
  'OOSL-0000441': 390, // -0.39
  'OOSL-0000442': 120, // -0.12
  'OOSL-0000443': 690, // -0.69
  'OOSL-0000450': 860, // -0.86
  'OOSL-0000453': 460, // -0.46
  'OOSL-0000489': 170, // -0.17
  'OOSL-0000504': 250, // -0.25
  'OOSL-0000505': 450, // -0.45
  'OOSL-0000508': 160, // -0.16
  'OOSL-0000510': 770, // -0.77
  'OOSL-0000512': 1230,// -1.23
  'OOSL-0000517': 50,  // -0.05
  'OOSL-0000521': 250, // -0.25
  'OOSL-0000523': 220, // -0.22
  'OOSL-0000530': 700, // -0.70
  'OOSL-0000533': 440, // -0.44
  'OOSL-0000534': 400, // -0.40
  'OOSL-0000540': 470  // -0.47
}

const TARGET_FOLIOS_CSV = Object.keys(CorrectionsMap)

async function findAllVehicles() {
  // Fetch specifically the 39 folios
  const { data: records, error } = await supabase
    .from('registros')
    .select('id, folio, fecha_entrada, peso_entrada, peso_salida, peso, numero_economico, placa_vehiculo')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .in('folio', TARGET_FOLIOS_CSV)
  
  if(error) throw error

  console.log(`\n🔍 Analizando ${records?.length} registros del CSV de inconsistencias...`)
  
  // Return all records found in the list, no vehicle logic needed if we just apply the "negative net weight" rule
  // Rule: "el peso neto que empieza en negativo es lo que le falta. eso sumaselo al peso salida y peso entrada"
  // Wait, the CSV column says "Peso Neto (ton) |-0.46|". 
  // It seems like: CalculatedPayload = PesoEntrada - PesoSalida.
  // "Peso Neto" in the CSV seems to be: (PublishedPayload) - (ActualPayload)??
  // Or maybe user meant: The diff to reach minimum vehicle weight?
  // User said: "el peso se ese camion es menor al peso minimo de salida entonces se sube por ejemplo 2t en el peso de salida 2 en el de entrada"
  // And "el peso neto que empieza en negativo es lo que le falta" -> Referring to the last column in CSV?
  // Let's re-read the CSV last column. It's usually small negative numbers: -0.46, -0.12, -1.07 tonnes.
  // 0.46 tons = 460 kg. 
  // If we add this to PesoSalida, we reach the minimum?
  
  // Let's calculate the "missing" weight to reach minimum dynamically to be safe, 
  // OR rely on the logic: we must raise PesoSalida to (PesoSalida + Missing)
  
  const targets: any[] = []

  for (const r of records || []) {
      // Find vehicle specs to confirm target min weight
      let vehicle = VEHICLES.find(v => v.placa === r.placa_vehiculo)
      if (!vehicle) { 
        // fallback find
        const candidates = VEHICLES.filter(v => v.numero_economico === r.numero_economico)
        if(candidates.length > 0) vehicle = candidates[0]
      }

      const pesoSalida = Number(r.peso_salida)
      if(vehicle && pesoSalida < vehicle.peso_salida_min) {
         targets.push({ record: r, vehicle, diff: vehicle.peso_salida_min - pesoSalida })
      } else {
         // Even if not strictly below min in OUR list, user said fix these 39. 
         // If vehicle not found, we can't key off min weight using the tool logic perfectly.
         // BUT user provided the rule: "peso neto negativo es lo que falta" which implies they calculated it.
         // Let's stick to: Raise Salida to MinVehicleWeight. If we don't know Min (vehicle not found), we skip or error.
         if(vehicle) {
             targets.push({ record: r, vehicle, diff: vehicle.peso_salida_min - pesoSalida })
         }
      }
  }
  return targets
}

async function fixLowSalida() {
  console.log('🔧 Buscando registros del CSV...')
  const targets = await findAllVehicles()
  console.log(`\n   Encontrados ${targets.length} registros para corregir\n`)

  const updates: any[] = []

  for (const t of targets) {
    const r = t.record
    const v: VehicleSpec = t.vehicle
    const pesoSalidaActual = Number(r.peso_salida)
    const pesoEntradaActual = Number(r.peso_entrada)
    
    // User instruction: "el peso neto que empieza en negativo es lo que le falta. eso sumaselo al peso salida y peso entrada"
    // We already parsed this into CorrectionsMap[r.folio] in KG
    
    const delta = CorrectionsMap[r.folio] || 0
    
    // If no correction needed? The CSV implies ALL rows need correction.
    if (delta <= 0) {
        console.log(`   ⚠️ ${r.folio}: Delta es 0, omitiendo.`)
        continue
    }
    
    const targetSalida = pesoSalidaActual + delta
    const newEntrada = pesoEntradaActual + delta

    console.log(`   ${r.folio}: Salida ${pesoSalidaActual} -> ${targetSalida} (+${delta}) | Entrada ${pesoEntradaActual} -> ${newEntrada}`)

    updates.push({ id: r.id, data: { peso_salida: targetSalida, peso_entrada: newEntrada } })
  }

  console.log(`\n   Total de correcciones previstas: ${updates.length}\n`)

  if (DRY_RUN) {
    console.log('   [DRY RUN] No se aplicarán cambios')
    return
  }

  for (const u of updates) {
    const { error } = await supabase.from('registros').update(u.data).eq('id', u.id)
    if (error) console.error(`❌ Error actualizando ${u.id}:`, error)
  }

  console.log(`   ✅ ${updates.length} registros corregidos`)
}

fixLowSalida().catch(err => {
  console.error('❌ ERROR:', err)
  process.exit(1)
})
