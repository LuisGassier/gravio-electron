/**
 * Diagnostic Script: Analizar problemas en registros de Enero 2026 - OOSLMP
 *
 * Este script genera un reporte detallado de:
 * 1. Folios duplicados con mismo peso el mismo día
 * 2. Peso de carga mayor que peso del camión
 * 3. Placas y número económico incompatibles
 * 4. Tiempos de permanencia menores a 10 minutos
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node scripts/diagnose_january_issues.ts
 */

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

dotenv.config({ path: '.env' })

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
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
  { numero_economico: '2017', placa: 'SP85738', tipo: 'COMPACTADOR_2_EJES', peso_salida_min: 13200, peso_salida_max: 15500, capacidad_min: 13000, capacidad_max: 14000 },
  { numero_economico: '2018', placa: 'SP85739', tipo: 'COMPACTADOR_2_EJES', peso_salida_min: 13200, peso_salida_max: 15500, capacidad_min: 13000, capacidad_max: 14000 },
  { numero_economico: '2013', placa: 'SN43215', tipo: 'COMPACTADOR_1_EJE', peso_salida_min: 10200, peso_salida_max: 11700, capacidad_min: 9000, capacidad_max: 10000 },
  { numero_economico: '2013', placa: 'SN46198', tipo: 'COMPACTADOR_1_EJE', peso_salida_min: 10200, peso_salida_max: 11700, capacidad_min: 9000, capacidad_max: 10000 },
  { numero_economico: '2010', placa: 'SM02293', tipo: 'COMPACTADOR_1_EJE', peso_salida_min: 10200, peso_salida_max: 11700, capacidad_min: 9000, capacidad_max: 10000 },
  { numero_economico: '2015', placa: 'SP81281', tipo: 'VOLTEO', peso_salida_min: 6000, peso_salida_max: 7500, capacidad_min: 5500, capacidad_max: 6500 },
  { numero_economico: '2012', placa: 'SN31022', tipo: 'VOLTEO', peso_salida_min: 6000, peso_salida_max: 7500, capacidad_min: 5500, capacidad_max: 6500 },
  { numero_economico: '2012', placa: 'SN31025', tipo: 'VOLTEO', peso_salida_min: 6000, peso_salida_max: 7500, capacidad_min: 5500, capacidad_max: 6500 },
  { numero_economico: '2012', placa: 'SN43220', tipo: 'VOLTEO', peso_salida_min: 6000, peso_salida_max: 7500, capacidad_min: 5500, capacidad_max: 6500 },
]

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
})

function formatMexicoDate(isoDate: string): string {
  const utc = new Date(isoDate)
  const mexico = new Date(utc.getTime() - 6 * 60 * 60 * 1000)
  return mexico.toISOString().replace('T', ' ').substring(0, 19)
}

async function diagnose() {
  console.log('═'.repeat(80))
  console.log('🔍 DIAGNÓSTICO DE REGISTROS ENERO 2026 - OOSLMP')
  console.log('═'.repeat(80))
  console.log(`   Empresa: ${CLAVE_EMPRESA}`)
  console.log(`   Periodo: ${START_DATE.toISOString()} - ${END_DATE.toISOString()}`)
  console.log('═'.repeat(80))
  console.log('')

  const { data: records, error } = await supabase
    .from('registros')
    .select('*')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', START_DATE.toISOString())
    .lte('fecha_entrada', END_DATE.toISOString())
    .order('fecha_entrada', { ascending: true })

  if (error) {
    console.error('❌ Error obteniendo registros:', error)
    throw error
  }

  console.log(`📊 Total de registros en enero: ${records?.length || 0}`)
  console.log('')

  // Problema 1: Folios duplicados con mismo peso el mismo día
  console.log('1️⃣  FOLIOS DUPLICADOS CON MISMO PESO EL MISMO DÍA')
  console.log('─'.repeat(80))

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

  let duplicatesCount = 0
  for (const [key, recs] of dayPesoMap) {
    if (recs.length > 1) {
      duplicatesCount++
      console.log(`\n   📋 Grupo ${duplicatesCount}: ${key}`)
      console.log(`      Total de registros duplicados: ${recs.length}`)
      for (const rec of recs) {
        console.log(`      - Folio: ${rec.folio} | Peso: ${rec.peso} kg | Entrada: ${formatMexicoDate(rec.fecha_entrada)} | Vehículo: ${rec.numero_economico} (${rec.placa_vehiculo})`)
      }
    }
  }

  if (duplicatesCount === 0) {
    console.log('   ✅ No se encontraron folios duplicados')
  } else {
    console.log(`\n   Total de grupos duplicados: ${duplicatesCount}`)
  }
  console.log('')

  // Problema 2: Peso de carga mayor que peso del camión
  console.log('2️⃣  PESO DE CARGA MAYOR QUE PESO DEL CAMIÓN')
  console.log('─'.repeat(80))

  let invalidWeightsCount = 0
  for (const record of records || []) {
    const pesoEntrada = Number(record.peso_entrada)
    const pesoSalida = Number(record.peso_salida)
    const pesoCarga = pesoEntrada - pesoSalida

    if (pesoCarga > pesoEntrada || pesoSalida > pesoEntrada) {
      invalidWeightsCount++
      const vehicle = VEHICLES.find(v =>
        v.placa === record.placa_vehiculo ||
        v.numero_economico === record.numero_economico
      )
      console.log(`\n   ❌ Folio: ${record.folio}`)
      console.log(`      Entrada: ${pesoEntrada.toFixed(0)} kg | Salida: ${pesoSalida.toFixed(0)} kg | Carga: ${pesoCarga.toFixed(0)} kg`)
      console.log(`      Vehículo: ${record.numero_economico} (${record.placa_vehiculo})`)
      if (vehicle) {
        console.log(`      Capacidad esperada: ${vehicle.capacidad_min}-${vehicle.capacidad_max} kg`)
        console.log(`      Peso vehículo esperado: ${vehicle.peso_salida_min}-${vehicle.peso_salida_max} kg`)
      }
      console.log(`      Fecha: ${formatMexicoDate(record.fecha_entrada)}`)
    }
  }

  if (invalidWeightsCount === 0) {
    console.log('   ✅ No se encontraron pesos inválidos')
  } else {
    console.log(`\n   Total de registros con pesos inválidos: ${invalidWeightsCount}`)
  }
  console.log('')

  // Problema 3: Placas y número económico incompatibles
  console.log('3️⃣  PLACAS Y NÚMERO ECONÓMICO INCOMPATIBLES')
  console.log('─'.repeat(80))

  let incompatibleCount = 0
  const incompatibleGroups = {
    numero_economico_incorrecto: [] as any[],
    placa_incorrecta: [] as any[],
    vehiculo_desconocido: [] as any[]
  }

  for (const record of records || []) {
    const vehicleByPlaca = VEHICLES.find(v => v.placa === record.placa_vehiculo)

    if (vehicleByPlaca) {
      if (vehicleByPlaca.numero_economico !== record.numero_economico) {
        incompatibleCount++
        incompatibleGroups.numero_economico_incorrecto.push({
          record,
          expected: vehicleByPlaca.numero_economico,
          current: record.numero_economico
        })
      }
    } else {
      const vehiclesByNumero = VEHICLES.filter(v => v.numero_economico === record.numero_economico)

      if (vehiclesByNumero.length > 0) {
        incompatibleCount++
        incompatibleGroups.placa_incorrecta.push({
          record,
          expected: vehiclesByNumero[0].placa,
          current: record.placa_vehiculo,
          options: vehiclesByNumero
        })
      } else {
        incompatibleCount++
        const peso = Number(record.peso)
        let tipo = 'DESCONOCIDO'
        if (peso >= 13000) tipo = 'COMPACTADOR_2_EJES'
        else if (peso >= 9000) tipo = 'COMPACTADOR_1_EJE'
        else tipo = 'VOLTEO'

        incompatibleGroups.vehiculo_desconocido.push({
          record,
          tipo_sugerido: tipo
        })
      }
    }
  }

  if (incompatibleGroups.numero_economico_incorrecto.length > 0) {
    console.log(`\n   📝 Número económico incorrecto (${incompatibleGroups.numero_economico_incorrecto.length} registros):`)
    for (const item of incompatibleGroups.numero_economico_incorrecto.slice(0, 10)) {
      console.log(`      Folio: ${item.record.folio} | Placa: ${item.record.placa_vehiculo} | Actual: ${item.current} → Esperado: ${item.expected}`)
    }
    if (incompatibleGroups.numero_economico_incorrecto.length > 10) {
      console.log(`      ... y ${incompatibleGroups.numero_economico_incorrecto.length - 10} más`)
    }
  }

  if (incompatibleGroups.placa_incorrecta.length > 0) {
    console.log(`\n   🚗 Placa incorrecta (${incompatibleGroups.placa_incorrecta.length} registros):`)
    for (const item of incompatibleGroups.placa_incorrecta.slice(0, 10)) {
      console.log(`      Folio: ${item.record.folio} | Número: ${item.record.numero_economico} | Actual: ${item.current} → Esperado: ${item.expected}`)
      if (item.options.length > 1) {
        console.log(`         NOTA: Número económico ${item.record.numero_economico} tiene ${item.options.length} placas posibles:`)
        for (const opt of item.options) {
          console.log(`            - ${opt.placa}`)
        }
      }
    }
    if (incompatibleGroups.placa_incorrecta.length > 10) {
      console.log(`      ... y ${incompatibleGroups.placa_incorrecta.length - 10} más`)
    }
  }

  if (incompatibleGroups.vehiculo_desconocido.length > 0) {
    console.log(`\n   ❓ Vehículo desconocido (${incompatibleGroups.vehiculo_desconocido.length} registros):`)
    for (const item of incompatibleGroups.vehiculo_desconocido.slice(0, 10)) {
      console.log(`      Folio: ${item.record.folio} | Número: ${item.record.numero_economico} | Placa: ${item.record.placa_vehiculo} | Peso: ${item.record.peso} kg → Tipo sugerido: ${item.tipo_sugerido}`)
    }
    if (incompatibleGroups.vehiculo_desconocido.length > 10) {
      console.log(`      ... y ${incompatibleGroups.vehiculo_desconocido.length - 10} más`)
    }
  }

  if (incompatibleCount === 0) {
    console.log('   ✅ No se encontraron incompatibilidades')
  } else {
    console.log(`\n   Total de registros incompatibles: ${incompatibleCount}`)
  }
  console.log('')

  // Problema 4: Tiempos de permanencia cortos
  console.log('4️⃣  TIEMPOS DE PERMANENCIA MENORES A 10 MINUTOS')
  console.log('─'.repeat(80))

  let shortDurationsCount = 0
  const durationStats = {
    min: Infinity,
    max: -Infinity,
    total: 0,
    count: 0
  }

  for (const record of records || []) {
    if (!record.fecha_entrada || !record.fecha_salida) continue

    const entrada = new Date(record.fecha_entrada)
    const salida = new Date(record.fecha_salida)
    const durationMinutes = (salida.getTime() - entrada.getTime()) / 60000

    durationStats.total += durationMinutes
    durationStats.count++
    if (durationMinutes < durationStats.min) durationStats.min = durationMinutes
    if (durationMinutes > durationStats.max) durationStats.max = durationMinutes

    if (durationMinutes < 10) {
      shortDurationsCount++
      if (shortDurationsCount <= 20) {
        console.log(`   ❌ Folio: ${record.folio} | Duración: ${durationMinutes.toFixed(1)} min | Entrada: ${formatMexicoDate(record.fecha_entrada)}`)
      }
    }
  }

  if (shortDurationsCount > 20) {
    console.log(`   ... y ${shortDurationsCount - 20} más`)
  }

  if (shortDurationsCount === 0) {
    console.log('   ✅ No se encontraron duraciones menores a 10 minutos')
  } else {
    console.log(`\n   Total de registros con duración < 10 min: ${shortDurationsCount}`)
  }

  const avgDuration = durationStats.count > 0 ? durationStats.total / durationStats.count : 0
  console.log(`\n   📊 Estadísticas de duración (todos los registros):`)
  console.log(`      Promedio: ${avgDuration.toFixed(1)} min`)
  console.log(`      Mínimo: ${durationStats.min.toFixed(1)} min`)
  console.log(`      Máximo: ${durationStats.max.toFixed(1)} min`)
  console.log('')

  // Resumen
  console.log('═'.repeat(80))
  console.log('📊 RESUMEN DE PROBLEMAS')
  console.log('═'.repeat(80))
  console.log(`   1. Folios duplicados:                  ${duplicatesCount} grupos`)
  console.log(`   2. Pesos inválidos:                    ${invalidWeightsCount} registros`)
  console.log(`   3. Placas/números incompatibles:       ${incompatibleCount} registros`)
  console.log(`      - Número económico incorrecto:      ${incompatibleGroups.numero_economico_incorrecto.length}`)
  console.log(`      - Placa incorrecta:                 ${incompatibleGroups.placa_incorrecta.length}`)
  console.log(`      - Vehículo desconocido:             ${incompatibleGroups.vehiculo_desconocido.length}`)
  console.log(`   4. Duraciones < 10 min:                ${shortDurationsCount} registros`)
  console.log('═'.repeat(80))
  console.log('')
  console.log('💡 Para corregir estos problemas, ejecuta:')
  console.log('   DRY_RUN=false npx ts-node scripts/fix_january_issues.ts')
  console.log('')
}

diagnose().catch(err => {
  console.error('')
  console.error('═'.repeat(80))
  console.error('❌ ERROR FATAL')
  console.error('═'.repeat(80))
  console.error(err)
  console.error('')
  process.exit(1)
})
