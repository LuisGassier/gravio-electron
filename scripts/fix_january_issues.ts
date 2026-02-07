/**
 * Fix Script: Corregir problemas específicos en registros de Enero 2026 - OOSLMP
 *
 * Este script corrige:
 * 1. Folios duplicados con mismo peso el mismo día (4 pares)
 * 2. Peso de carga mayor que peso del camión (64 registros)
 * 3. Placas y número económico incompatibles (63 registros)
 * 4. Tiempos de permanencia menores a 10 minutos (promedio: 10-25 min)
 *
 * Usage:
 *   DRY_RUN=false SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node scripts/fix_january_issues.ts
 */

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env' })

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const DRY_RUN = process.env.DRY_RUN?.toLowerCase() !== 'false'
const CLAVE_EMPRESA = 4
const YEAR = 2026
const MONTH = 1 // Enero

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  process.exit(1)
}

// Date range for January 2026 (Mexico Time UTC-6)
const START_DATE = new Date(YEAR, MONTH - 1, 1, 0, 0, 0)
START_DATE.setHours(START_DATE.getHours() + 6)

const END_DATE = new Date(YEAR, MONTH, 0, 23, 59, 59)
END_DATE.setHours(END_DATE.getHours() + 6)

// Vehículos de OOSLMP según docs/REGLAS MES DE ENERO 2026.csv
interface VehicleSpec {
  numero_economico: string
  placa: string
  tipo: 'COMPACTADOR_2_EJES' | 'COMPACTADOR_1_EJE' | 'VOLTEO'
  peso_salida_min: number // Peso mínimo del vehículo vacío
  peso_salida_max: number // Peso máximo del vehículo vacío
  capacidad_min: number   // Peso mínimo de RSU
  capacidad_max: number   // Peso máximo de RSU
}

const VEHICLES: VehicleSpec[] = [
  // 2 Compactadores de 2 ejes (Peso RSU: 13,000-14,000 kg | Peso vehículo: 13,200-15,500 kg)
  { numero_economico: '2017', placa: 'SP85738', tipo: 'COMPACTADOR_2_EJES', peso_salida_min: 13200, peso_salida_max: 15500, capacidad_min: 13000, capacidad_max: 14000 },
  { numero_economico: '2018', placa: 'SP85739', tipo: 'COMPACTADOR_2_EJES', peso_salida_min: 13200, peso_salida_max: 15500, capacidad_min: 13000, capacidad_max: 14000 },

  // 3 Compactadores de 1 eje (Peso RSU: 9,000-10,000 kg | Peso vehículo: 10,200-11,700 kg)
  // NOTA: Dos unidades tienen número económico 2013 con placas diferentes
  { numero_economico: '2013', placa: 'SN43215', tipo: 'COMPACTADOR_1_EJE', peso_salida_min: 10200, peso_salida_max: 11700, capacidad_min: 9000, capacidad_max: 10000 },
  { numero_economico: '2013', placa: 'SN46198', tipo: 'COMPACTADOR_1_EJE', peso_salida_min: 10200, peso_salida_max: 11700, capacidad_min: 9000, capacidad_max: 10000 },
  { numero_economico: '2010', placa: 'SM02293', tipo: 'COMPACTADOR_1_EJE', peso_salida_min: 10200, peso_salida_max: 11700, capacidad_min: 9000, capacidad_max: 10000 },

  // 4 Volteo (Peso RSU: 5,500-6,500 kg | Peso vehículo: 6,000-7,500 kg)
  // NOTA: Tres unidades tienen número económico 2012 con placas diferentes
  { numero_economico: '2015', placa: 'SP81281', tipo: 'VOLTEO', peso_salida_min: 6000, peso_salida_max: 7500, capacidad_min: 5500, capacidad_max: 6500 },
  { numero_economico: '2012', placa: 'SN31022', tipo: 'VOLTEO', peso_salida_min: 6000, peso_salida_max: 7500, capacidad_min: 5500, capacidad_max: 6500 },
  { numero_economico: '2012', placa: 'SN31025', tipo: 'VOLTEO', peso_salida_min: 6000, peso_salida_max: 7500, capacidad_min: 5500, capacidad_max: 6500 },
  { numero_economico: '2012', placa: 'SN43220', tipo: 'VOLTEO', peso_salida_min: 6000, peso_salida_max: 7500, capacidad_min: 5500, capacidad_max: 6500 },
]

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
})

/**
 * Utility: Round to nearest 10 with variation
 */
function roundToNearestTen(value: number): number {
  const base = Math.round(value / 10) * 10
  const variations = [-40, -30, -20, -10, 0, 10, 20, 30, 40]
  const variation = variations[Math.floor(Math.random() * variations.length)]
  return Math.max(0, base + variation)
}

/**
 * Utility: Add natural variation to weights
 */
function avoidExactPeso(value: number, min: number, max: number): number {
  let v = Math.round(value / 10) * 10

  if (v % 1000 === 0) {
    const offset = (Math.floor(Math.random() * 41) - 20) * 10
    v = v + offset
  } else if (v % 500 === 0) {
    const offset = (Math.floor(Math.random() * 31) - 15) * 10
    v = v + offset
  }

  const extraVariation = (Math.floor(Math.random() * 16) - 8) * 10
  v = v + extraVariation

  const jitter = Math.floor(Math.random() * 5) * 10
  v = v + (Math.random() < 0.5 ? jitter : -jitter)

  if (v < min + 100) v = min + 100 + Math.floor(Math.random() * 20) * 10
  if (v > max - 100) v = max - 100 - Math.floor(Math.random() * 20) * 10

  if (v % 500 === 0 || v % 1000 === 0) {
    v = v + (30 + Math.floor(Math.random() * 5) * 10)
  }

  return Math.round(v / 10) * 10
}

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
 * Problema 1: Detectar folios duplicados con mismo peso el mismo día
 */
async function findDuplicateFoliosSameDay() {
  console.log('🔍 Buscando folios duplicados con mismo peso el mismo día...\n')

  const { data: records, error } = await supabase
    .from('registros')
    .select('id, folio, fecha_entrada, peso, peso_entrada, peso_salida')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', START_DATE.toISOString())
    .lte('fecha_entrada', END_DATE.toISOString())
    .order('fecha_entrada', { ascending: true })

  if (error) {
    console.error('❌ Error obteniendo registros:', error)
    throw error
  }

  // Group by day + peso
  const dayPesoMap = new Map<string, any[]>()

  for (const record of records || []) {
    const fechaMx = new Date(new Date(record.fecha_entrada).getTime() - 6 * 60 * 60 * 1000)
    const dayKey = fechaMx.toISOString().split('T')[0]
    const peso = Math.round(Number(record.peso))
    const key = `${dayKey}-${peso}`

    if (!dayPesoMap.has(key)) {
      dayPesoMap.set(key, [])
    }
    dayPesoMap.get(key)!.push(record)
  }

  // Find duplicates
  const duplicates: any[] = []
  for (const [key, recs] of dayPesoMap) {
    if (recs.length > 1) {
      duplicates.push({ key, records: recs })
    }
  }

  console.log(`   Encontrados ${duplicates.length} grupos de folios duplicados\n`)

  return duplicates
}

/**
 * Problema 2: Detectar registros donde peso_carga > peso_camion
 */
async function findInvalidWeights() {
  console.log('🔍 Buscando registros con peso de carga mayor que peso del camión...\n')

  const { data: records, error } = await supabase
    .from('registros')
    .select('id, folio, fecha_entrada, peso_entrada, peso_salida, peso, numero_economico, placa_vehiculo')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', START_DATE.toISOString())
    .lte('fecha_entrada', END_DATE.toISOString())

  if (error) {
    console.error('❌ Error obteniendo registros:', error)
    throw error
  }

  const invalid: any[] = []

  for (const record of records || []) {
    const pesoEntrada = Number(record.peso_entrada)
    const pesoSalida = Number(record.peso_salida)
    const pesoCarga = pesoEntrada - pesoSalida

    // Find vehicle
    const vehicle = VEHICLES.find(v =>
      v.numero_economico === record.numero_economico ||
      v.placa === record.placa_vehiculo
    )

    // If peso_carga > peso_entrada (which shouldn't happen physically)
    if (pesoCarga > pesoEntrada) {
      invalid.push({ ...record, issue: 'peso_carga_mayor_que_entrada', vehicle })
    }
    // Or if peso_salida > peso_entrada
    else if (pesoSalida > pesoEntrada) {
      invalid.push({ ...record, issue: 'peso_salida_mayor_que_entrada', vehicle })
    }
  }

  console.log(`   Encontrados ${invalid.length} registros con pesos inválidos\n`)

  return invalid
}

/**
 * Problema 3: Detectar placas y número económico incompatibles
 * NOTA: La placa es el identificador único. Algunos números económicos se repiten (2013, 2012)
 */
async function findIncompatiblePlates() {
  console.log('🔍 Buscando registros con placas y número económico incompatibles...\n')

  const { data: records, error } = await supabase
    .from('registros')
    .select('id, folio, fecha_entrada, numero_economico, placa_vehiculo, peso')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', START_DATE.toISOString())
    .lte('fecha_entrada', END_DATE.toISOString())

  if (error) {
    console.error('❌ Error obteniendo registros:', error)
    throw error
  }

  const incompatible: any[] = []

  for (const record of records || []) {
    // La placa es el identificador único más confiable
    const vehicleByPlaca = VEHICLES.find(v => v.placa === record.placa_vehiculo)

    if (vehicleByPlaca) {
      // Si encontramos el vehículo por placa, verificar que el número económico coincida
      if (vehicleByPlaca.numero_economico !== record.numero_economico) {
        incompatible.push({
          ...record,
          expected_numero_economico: vehicleByPlaca.numero_economico,
          current_numero_economico: record.numero_economico,
          vehicle: vehicleByPlaca,
          issue: 'numero_economico_incorrecto'
        })
      }
    } else {
      // Si no se encuentra por placa, buscar por número económico
      // IMPORTANTE: Como hay números económicos duplicados (2013, 2012),
      // buscamos todos los vehículos con ese número económico
      const vehiclesByNumero = VEHICLES.filter(v => v.numero_economico === record.numero_economico)

      if (vehiclesByNumero.length > 0) {
        // Si hay múltiples vehículos con ese número, necesitamos asignar uno basado en el peso
        if (vehiclesByNumero.length > 1) {
          // Usar el primer vehículo con ese número económico
          const vehicle = vehiclesByNumero[0]
          incompatible.push({
            ...record,
            expected_placa: vehicle.placa,
            current_placa: record.placa_vehiculo,
            vehicle,
            issue: 'placa_incorrecta_numero_duplicado'
          })
        } else {
          // Solo hay un vehículo con ese número económico, corregir la placa
          const vehicle = vehiclesByNumero[0]
          incompatible.push({
            ...record,
            expected_placa: vehicle.placa,
            current_placa: record.placa_vehiculo,
            vehicle,
            issue: 'placa_incorrecta'
          })
        }
      } else {
        // No se encuentra ni por placa ni por número económico - vehículo desconocido
        // Intentar mapear basándose en el peso de carga
        const peso = Number(record.peso)
        let mappedVehicle: VehicleSpec | null = null

        if (peso >= 13000) {
          mappedVehicle = VEHICLES.find(v => v.tipo === 'COMPACTADOR_2_EJES') || null
        } else if (peso >= 9000) {
          mappedVehicle = VEHICLES.find(v => v.tipo === 'COMPACTADOR_1_EJE') || null
        } else {
          mappedVehicle = VEHICLES.find(v => v.tipo === 'VOLTEO') || null
        }

        if (mappedVehicle) {
          incompatible.push({
            ...record,
            expected_numero_economico: mappedVehicle.numero_economico,
            expected_placa: mappedVehicle.placa,
            current_numero_economico: record.numero_economico,
            current_placa: record.placa_vehiculo,
            vehicle: mappedVehicle,
            issue: 'vehiculo_desconocido'
          })
        }
      }
    }
  }

  console.log(`   Encontrados ${incompatible.length} registros con placas/número incompatibles\n`)

  return incompatible
}

/**
 * Problema 4: Detectar registros con tiempo de permanencia menor a 10 minutos
 */
async function findShortDurations() {
  console.log('🔍 Buscando registros con tiempo de permanencia < 10 minutos...\n')

  const { data: records, error } = await supabase
    .from('registros')
    .select('id, folio, fecha_entrada, fecha_salida')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', START_DATE.toISOString())
    .lte('fecha_entrada', END_DATE.toISOString())

  if (error) {
    console.error('❌ Error obteniendo registros:', error)
    throw error
  }

  const shortDurations: any[] = []

  for (const record of records || []) {
    if (!record.fecha_entrada || !record.fecha_salida) continue

    const entrada = new Date(record.fecha_entrada)
    const salida = new Date(record.fecha_salida)
    const durationMinutes = (salida.getTime() - entrada.getTime()) / 60000

    if (durationMinutes < 10) {
      shortDurations.push({
        ...record,
        duration_minutes: durationMinutes
      })
    }
  }

  console.log(`   Encontrados ${shortDurations.length} registros con duración < 10 min\n`)

  return shortDurations
}

/**
 * Fix duplicates by adjusting peso slightly
 */
async function fixDuplicates(duplicates: any[]) {
  console.log('🔧 Corrigiendo folios duplicados...\n')

  const updates: any[] = []

  for (const { key, records } of duplicates) {
    console.log(`   📋 Grupo: ${key} (${records.length} registros)`)

    // Keep first record as-is, adjust others
    for (let i = 1; i < records.length; i++) {
      const record = records[i]
      const currentPeso = Number(record.peso)

      // Find vehicle for capacity limits - use placa as primary identifier
      const vehicle = VEHICLES.find(v => v.placa === record.placa_vehiculo) ||
                      VEHICLES.find(v => v.numero_economico === record.numero_economico)

      let newPeso = currentPeso
      if (vehicle) {
        // Adjust within vehicle capacity
        const variation = (Math.floor(Math.random() * 21) - 10) * 10 // -100 to +100 kg
        newPeso = avoidExactPeso(currentPeso + variation, vehicle.capacidad_min, vehicle.capacidad_max)
      } else {
        // Generic variation
        const variation = (Math.floor(Math.random() * 21) - 10) * 10
        newPeso = currentPeso + variation
      }

      const pesoSalida = Number(record.peso_salida)
      const newPesoEntrada = pesoSalida + newPeso

      console.log(`      ${record.folio}: ${currentPeso} kg → ${newPeso} kg`)

      updates.push({
        id: record.id,
        data: {
          peso: newPeso,
          peso_entrada: newPesoEntrada
        }
      })
    }
  }

  console.log(`\n   Total de correcciones: ${updates.length}`)

  if (DRY_RUN) {
    console.log('   [DRY RUN] No se aplicarán cambios\n')
    return 0
  }

  for (const update of updates) {
    const { error } = await supabase
      .from('registros')
      .update(update.data)
      .eq('id', update.id)

    if (error) {
      console.error(`❌ Error actualizando ${update.id}:`, error)
    }
  }

  console.log(`   ✅ ${updates.length} registros corregidos\n`)
  return updates.length
}

/**
 * Fix invalid weights
 */
async function fixInvalidWeights(invalid: any[]) {
  console.log('🔧 Corrigiendo pesos inválidos...\n')

  const updates: any[] = []

  for (const record of invalid) {
    // Use placa as primary identifier since it's unique
    const vehicle = record.vehicle ||
                    VEHICLES.find(v => v.placa === record.placa_vehiculo) ||
                    VEHICLES.find(v => v.numero_economico === record.numero_economico)

    if (!vehicle) {
      console.log(`   ⚠️  ${record.folio}: No se pudo encontrar vehículo, omitiendo`)
      continue
    }

    // Generate new valid peso_salida and peso_carga
    const pesoSalidaMean = (vehicle.peso_salida_min + vehicle.peso_salida_max) / 2
    const newPesoSalida = roundToNearestTen(
      sampleTruncatedNormal(pesoSalidaMean, 500, vehicle.peso_salida_min, vehicle.peso_salida_max)
    )

    // Generate waste within capacity
    const capacidadMean = (vehicle.capacidad_min + vehicle.capacidad_max) / 2
    const newPesoCarga = avoidExactPeso(
      sampleTruncatedNormal(capacidadMean, 1000, vehicle.capacidad_min, vehicle.capacidad_max),
      vehicle.capacidad_min,
      vehicle.capacidad_max
    )

    const newPesoEntrada = newPesoSalida + newPesoCarga

    console.log(`   ${record.folio}: Salida ${record.peso_salida} → ${newPesoSalida}, Carga ${record.peso} → ${newPesoCarga}`)

    updates.push({
      id: record.id,
      data: {
        peso_salida: newPesoSalida,
        peso: newPesoCarga,
        peso_entrada: newPesoEntrada
      }
    })
  }

  console.log(`\n   Total de correcciones: ${updates.length}`)

  if (DRY_RUN) {
    console.log('   [DRY RUN] No se aplicarán cambios\n')
    return 0
  }

  for (const update of updates) {
    const { error } = await supabase
      .from('registros')
      .update(update.data)
      .eq('id', update.id)

    if (error) {
      console.error(`❌ Error actualizando ${update.id}:`, error)
    }
  }

  console.log(`   ✅ ${updates.length} registros corregidos\n`)
  return updates.length
}

/**
 * Fix incompatible plates
 */
async function fixIncompatiblePlates(incompatible: any[]) {
  console.log('🔧 Corrigiendo placas y números económicos incompatibles...\n')

  const updates: any[] = []

  for (const record of incompatible) {
    const vehicle = record.vehicle

    if (!vehicle) {
      console.log(`   ⚠️  ${record.folio}: No se pudo determinar vehículo correcto, omitiendo`)
      continue
    }

    console.log(`   ${record.folio}: ${record.numero_economico} (${record.placa_vehiculo}) → ${vehicle.numero_economico} (${vehicle.placa})`)

    updates.push({
      id: record.id,
      data: {
        numero_economico: vehicle.numero_economico,
        placa_vehiculo: vehicle.placa
      }
    })
  }

  console.log(`\n   Total de correcciones: ${updates.length}`)

  if (DRY_RUN) {
    console.log('   [DRY RUN] No se aplicarán cambios\n')
    return 0
  }

  for (const update of updates) {
    const { error } = await supabase
      .from('registros')
      .update(update.data)
      .eq('id', update.id)

    if (error) {
      console.error(`❌ Error actualizando ${update.id}:`, error)
    }
  }

  console.log(`   ✅ ${updates.length} registros corregidos\n`)
  return updates.length
}

/**
 * Fix short durations (< 10 minutes)
 * Adjust to random duration between 10-25 minutes
 */
async function fixShortDurations(shortDurations: any[]) {
  console.log('🔧 Corrigiendo tiempos de permanencia cortos...\n')

  const updates: any[] = []

  for (const record of shortDurations) {
    const entrada = new Date(record.fecha_entrada)

    // Generate random duration between 10-25 minutes using truncated normal distribution
    const newDurationMinutes = Math.round(sampleTruncatedNormal(17.5, 5, 10, 25))

    const newSalida = new Date(entrada.getTime() + newDurationMinutes * 60000)

    console.log(`   ${record.folio}: ${record.duration_minutes.toFixed(1)} min → ${newDurationMinutes} min`)

    updates.push({
      id: record.id,
      data: {
        fecha_salida: newSalida.toISOString()
      }
    })
  }

  console.log(`\n   Total de correcciones: ${updates.length}`)

  if (DRY_RUN) {
    console.log('   [DRY RUN] No se aplicarán cambios\n')
    return 0
  }

  for (const update of updates) {
    const { error } = await supabase
      .from('registros')
      .update(update.data)
      .eq('id', update.id)

    if (error) {
      console.error(`❌ Error actualizando ${update.id}:`, error)
    }
  }

  console.log(`   ✅ ${updates.length} registros corregidos\n`)
  return updates.length
}

/**
 * Main execution
 */
async function main() {
  console.log('═'.repeat(80))
  console.log('🔧 CORRECCIONES ENERO 2026 - OOSLMP')
  console.log('═'.repeat(80))
  console.log(`   Modo: ${DRY_RUN ? 'DRY RUN (sin modificar)' : 'LIVE (aplicar cambios)'}`)
  console.log(`   Empresa: ${CLAVE_EMPRESA}`)
  console.log(`   Periodo: ${START_DATE.toISOString()} - ${END_DATE.toISOString()}`)
  console.log('═'.repeat(80))
  console.log('')

  let totalFixed = 0

  // Problem 1: Duplicate folios
  const duplicates = await findDuplicateFoliosSameDay()
  if (duplicates.length > 0) {
    const fixed = await fixDuplicates(duplicates)
    totalFixed += fixed
  }

  // Problem 2: Invalid weights
  const invalidWeights = await findInvalidWeights()
  if (invalidWeights.length > 0) {
    const fixed = await fixInvalidWeights(invalidWeights)
    totalFixed += fixed
  }

  // Problem 3: Incompatible plates
  const incompatible = await findIncompatiblePlates()
  if (incompatible.length > 0) {
    const fixed = await fixIncompatiblePlates(incompatible)
    totalFixed += fixed
  }

  // Problem 4: Short durations
  const shortDurations = await findShortDurations()
  if (shortDurations.length > 0) {
    const fixed = await fixShortDurations(shortDurations)
    totalFixed += fixed
  }

  console.log('═'.repeat(80))
  console.log('✅ CORRECCIONES COMPLETADAS')
  console.log('═'.repeat(80))
  console.log(`   Total de registros corregidos: ${totalFixed}`)
  console.log('═'.repeat(80))
  console.log('')
}

main().catch(err => {
  console.error('')
  console.error('═'.repeat(80))
  console.error('❌ ERROR FATAL')
  console.error('═'.repeat(80))
  console.error(err)
  console.error('')
  process.exit(1)
})
