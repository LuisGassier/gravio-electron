
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const CLAVE_EMPRESA = 4

// Rango de Diciembre 2025
const START_DATE = '2025-12-01T00:00:00-06:00'
const END_DATE = '2025-12-31T23:59:59-06:00'

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Faltan variables de entorno')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function verify() {
  console.log('🔍 Verificando reglas para Diciembre 2025...')

  const { data: records, error } = await supabase
    .from('registros')
    .select('*')
    .eq('clave_empresa', CLAVE_EMPRESA)
    .gte('fecha_entrada', START_DATE)
    .lte('fecha_entrada', END_DATE)
    .order('fecha_entrada', { ascending: true })

  if (error) throw error

  console.log(`📄 Total registros encontrados en Diciembre: ${records.length}`)

  // 1. Verificar Total de Toneladas (Usando columna 'peso')
  const totalPeso = records.reduce((sum, r) => sum + (r.peso || 0), 0)
  const totalToneladas = totalPeso / 1000
  console.log(`⚖️  Peso Total: ${totalToneladas.toFixed(2)} tons (${totalPeso} kg)`)
  console.log(`   Meta: 2,751.37 tons (2,751,370 kg)`)
  console.log(`   Diferencia: ${(2751370 - totalPeso)} kg`)

  // Verificar decimales
  const withDecimals = records.filter(r => (r.peso_entrada % 1 !== 0) || (r.peso_salida % 1 !== 0))
  if (withDecimals.length > 0) {
      console.warn(`⚠️ ${withDecimals.length} registros tienen decimales en entrada/salida!`)
  } else {
      console.log('✅ Ningún registro tiene decimales.')
  }

  // Verificar múltiplos de 10 (físicos y virtuales por igual ahora)
  const nonTen = records.filter(r => (r.peso_entrada % 10 !== 0) || (r.peso_salida % 10 !== 0))
  if (nonTen.length > 0) {
      console.warn(`⚠️ ${nonTen.length} registros NO terminan en 0 (no son múltiplos de 10).`)
      // check if any is the "decimal exception"
  } else {
      console.log('✅ Todos los registros son múltiplos de 10.')
  }


  // 2. Verificar Secuencia de Folios
  let brokenSequence = false
  for (let i = 0; i < records.length - 1; i++) {
    const current = parseInt(records[i].folio.split('-')[1])
    const next = parseInt(records[i+1].folio.split('-')[1])
    if (next !== current + 1) {
      console.error(`❌ Salto de folio detectado: ${records[i].folio} -> ${records[i+1].folio}`)
      brokenSequence = true
    }
  }
  if (!brokenSequence) console.log('✅ Secuencia de folios interna continua.')

  // 3. Verificar Vehículos permitidos
  const validTrucks = [
    'ECO-03', 'ECO-12', 'ECO-13', 'ECO-14', 'ECO-29', // Carga trasera
    'S/N', '201', 'AMARELLO', 'VOLTEO'               // Volteos
  ]
  
  const unknownTrucks = records.filter(r => !validTrucks.includes(r.placa_vehiculo))
  if (unknownTrucks.length > 0) {
    console.warn(`⚠️ Vehículos no reconocidos encontrados: ${unknownTrucks.length}`)
    unknownTrucks.forEach(t => console.warn(`   - ${t.placa_vehiculo}`))
  } else {
    console.log('✅ Todos los vehículos son válidos.')
  }

  // 4. Conteo por Tipo
  const manual = records.filter(r => r.tipo_registro === 'NORMAL').length
  const virtual = records.filter(r => r.tipo_registro === 'VIRTUAL').length
  console.log(`📊 Distribución: ${manual} Físicos + ${virtual} Virtuales = ${records.length} Total`)
}

verify().catch(console.error)
