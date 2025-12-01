// Importaciones dinámicas para evitar problemas con ES modules
let SerialPort: any
let ReadlineParser: any

// Cargar módulos al inicio
async function loadModules() {
  if (!SerialPort) {
    const serialportModule = await import('serialport')
    SerialPort = serialportModule.SerialPort
    
    const parserModule = await import('@serialport/parser-readline')
    ReadlineParser = parserModule.ReadlineParser
  }
}

let port: any = null
let parser: any = null
let currentWeight: string = ''

// Configuración por defecto para Mettler Toledo
const DEFAULT_CONFIG = {
  baudRate: 2400,
  dataBits: 8 as const,
  stopBits: 1 as const,
  parity: 'none' as const,
  autoOpen: false,
}

/**
 * Listar puertos seriales disponibles
 */
export async function listSerialPorts() {
  try {
    await loadModules()
    const ports = await SerialPort.list()
    console.log('🔌 Puertos raw encontrados:', ports)
    return ports.map((port: any) => ({
      path: port.path,
      manufacturer: port.manufacturer,
      serialNumber: port.serialNumber,
      vendorId: port.vendorId,
      productId: port.productId,
    }))
  } catch (error) {
    console.error('❌ Error al listar puertos:', error)
    return []
  }
}

/**
 * Parsear datos de báscula Mettler Toledo
 * Formato esperado: )0 1050 0500
 * - )0: Indicador de estabilidad (puede variar)
 * - 1050: Parte entera del peso
 * - 0500: Parte decimal (últimos 3-4 dígitos)
 */
function parseWeightData(data: string): number | null {
  try {
    // Limpiar espacios extras
    const cleaned = data.trim()
    
    // Patrón para formato Mettler Toledo: )0 1050 0500
    // También acepta variaciones como: +0 1050 0500, S 1050 0500, etc.
    const pattern = /[)>+\-SD]\s*(\d+)\s+(\d+)\s+(\d+)/
    const match = cleaned.match(pattern)
    
    if (match) {
      const [, , integer, decimal] = match
      // Combinar parte entera y decimal
      // Ejemplo: 1050 + 0.0500 = 1050.0500 kg
      const weight = parseFloat(`${integer}.${decimal}`)
      return weight
    }
    
    // Patrón alternativo más simple: solo números
    const simplePattern = /(\d+\.?\d*)/
    const simpleMatch = cleaned.match(simplePattern)
    
    if (simpleMatch) {
      return parseFloat(simpleMatch[1])
    }
    
    return null
  } catch (error) {
    console.error('❌ Error al parsear peso:', error)
    return null
  }
}

/**
 * Abrir puerto serial
 */
export async function openSerialPort(
  portPath: string, 
  baudRate: number = DEFAULT_CONFIG.baudRate,
  onDataCallback?: (weight: number) => void
): Promise<boolean> {
  try {
    // Cargar módulos primero
    await loadModules()
    
    // Cerrar puerto existente si hay uno
    if (port && port.isOpen) {
      await closeSerialPort()
    }

    port = new SerialPort({
      path: portPath,
      baudRate,
      dataBits: DEFAULT_CONFIG.dataBits,
      stopBits: DEFAULT_CONFIG.stopBits,
      parity: DEFAULT_CONFIG.parity,
      autoOpen: false,
    })

    // Parser de líneas (los datos vienen línea por línea)
    parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

    // Listener de datos
    parser.on('data', (data: string) => {
      console.log('📊 Datos recibidos:', data)
      
      const weight = parseWeightData(data)
      if (weight !== null) {
        currentWeight = weight.toString()
        console.log('⚖️ Peso parseado:', weight, 'kg')
        
        // Callback si se proporciona
        if (onDataCallback) {
          onDataCallback(weight)
        }
      }
    })

    // Manejo de errores
    port.on('error', (err: any) => {
      console.error('❌ Error en puerto serial:', err)
    })

    port.on('close', () => {
      console.log('🔌 Puerto serial cerrado')
    })

    // Abrir puerto
    await new Promise<void>((resolve, reject) => {
      port!.open((err: any) => {
        if (err) {
          reject(err)
        } else {
          console.log(`✅ Puerto serial ${portPath} abierto a ${baudRate} baud`)
          resolve()
        }
      })
    })

    return true
  } catch (error) {
    console.error('❌ Error al abrir puerto serial:', error)
    return false
  }
}

/**
 * Cerrar puerto serial
 */
export async function closeSerialPort(): Promise<void> {
  if (port && port.isOpen) {
    await new Promise<void>((resolve) => {
      port!.close((err: any) => {
        if (err) {
          console.error('❌ Error al cerrar puerto:', err)
        }
        port = null
        parser = null
        currentWeight = ''
        resolve()
      })
    })
  }
}

/**
 * Leer peso actual (último valor recibido)
 */
export function readCurrentWeight(): string {
  return currentWeight
}

/**
 * Verificar si el puerto está abierto
 */
export function isPortOpen(): boolean {
  return port !== null && port.isOpen
}

/**
 * Obtener información del puerto actual
 */
export function getPortInfo() {
  if (!port) return null
  
  return {
    path: port.path,
    baudRate: port.baudRate,
    isOpen: port.isOpen,
  }
}
