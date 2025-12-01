import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

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

export async function listSerialPorts(): Promise<{ success: boolean; ports?: Array<{ path: string; manufacturer?: string }>; error?: string }> {
  try {
    await loadModules()
    const ports = await SerialPort.list()
    console.log('🔌 Puertos raw encontrados (node-serialport):', ports)

    // En Windows, a veces node-serialport no detecta puertos virtuales (com0com).
    // Intentamos obtenerlos vía PowerShell como fallback.
    if (process.platform === 'win32') {
      try {
        const { stdout } = await execPromise('powershell -command "[System.IO.Ports.SerialPort]::GetPortNames()"')
        const psPorts = stdout.trim().split(/\r?\n/).filter(p => p && p.trim().length > 0)
        
        console.log('🔌 Puertos encontrados vía PowerShell:', psPorts)

        psPorts.forEach((psPort: string) => {
          const portName = psPort.trim()
          // Si el puerto no está en la lista de node-serialport, agregarlo
          if (!ports.find((p: any) => p.path === portName)) {
            ports.push({
              path: portName,
              manufacturer: 'Puerto Virtual (Detectado por OS)',
              serialNumber: undefined,
              vendorId: undefined,
              productId: undefined,
            })
          }
        })
      } catch (psError) {
        console.warn('⚠️ Error al listar puertos con PowerShell:', psError)
      }
    }

    const portList = ports.map((port: any) => ({
      path: port.path,
      manufacturer: port.manufacturer,
    }))

    return { success: true, ports: portList }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ Error al listar puertos:', errorMessage)
    return { success: false, error: errorMessage }
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
    const cleaned = data.trim()
    
    // Patrón específico: )0   2119    38
    const mettlerPattern = /\)0\s+(\d+)\s+(\d+)/
    const mettlerMatch = cleaned.match(mettlerPattern)

    if (mettlerMatch) {
      const [, integer, decimal] = mettlerMatch
      return parseFloat(`${integer}.${decimal}`)
    }

    // Patrón genérico (backup)
    const pattern = /[)>+\-SD]\s*(\d+)\s+(\d+)\s+(\d+)/
    const match = cleaned.match(pattern)
    
    if (match) {
      const [, , integer, decimal] = match
      return parseFloat(`${integer}.${decimal}`)
    }
    
    // Patrón simple
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
): Promise<{ success: boolean; error?: string }> {
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

    // Parser de líneas
    // Usamos \r como delimitador para soportar básculas que actualizan la línea
    parser = port.pipe(new ReadlineParser({ delimiter: '\r' }))

    // Listener de datos
    parser.on('data', (data: string) => {
      const cleanData = data.trim()
      if (!cleanData) return

      console.log(`📥 RAW: ${JSON.stringify(cleanData)}`)
      
      const weight = parseWeightData(cleanData)
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

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ Error al abrir puerto serial:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Cerrar puerto serial
 */
export async function closeSerialPort(): Promise<{ success: boolean; error?: string }> {
  try {
    if (port && port.isOpen) {
      await new Promise<void>((resolve, reject) => {
        port!.close((err: any) => {
          if (err) {
            console.error('❌ Error al cerrar puerto:', err)
            reject(err)
          } else {
            port = null
            parser = null
            currentWeight = ''
            resolve()
          }
        })
      })
    }
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { success: false, error: errorMessage }
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
