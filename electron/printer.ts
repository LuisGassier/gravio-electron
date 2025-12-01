import type { BrowserWindow } from 'electron'

export interface PrinterInfo {
  name: string
  displayName: string
  description: string
  status: number
  isDefault: boolean
  options: Record<string, any>
}

/**
 * Listar impresoras disponibles en el sistema
 */
export function listPrinters(mainWindow: BrowserWindow | null): PrinterInfo[] {
  console.log('📞 listPrinters() llamada - mainWindow:', mainWindow ? 'disponible' : 'NULL')

  try {
    if (!mainWindow) {
      console.warn('⚠️ No hay ventana principal disponible')
      return []
    }

    console.log('🔍 Obteniendo impresoras del sistema...')

    // Obtener impresoras del sistema usando Electron API
    // getPrinters() es un método síncrono de webContents
    const printers = (mainWindow.webContents as any).getPrinters()

    console.log('📋 Impresoras raw del sistema:', JSON.stringify(printers, null, 2))

    // Mapear a formato esperado
    const formattedPrinters: PrinterInfo[] = printers.map((printer: any) => ({
      name: printer.name,
      displayName: printer.displayName || printer.name,
      description: printer.description || '',
      status: printer.status || 0,
      isDefault: printer.isDefault || false,
      options: printer.options || {}
    }))

    console.log('✅ Impresoras detectadas:', formattedPrinters.length)
    console.log('📄 Impresoras formateadas:', JSON.stringify(formattedPrinters, null, 2))

    return formattedPrinters
  } catch (error) {
    console.error('❌ Error al listar impresoras:', error)
    console.error('📚 Stack trace:', (error as Error).stack)
    return []
  }
}

/**
 * Imprimir datos en una impresora térmica
 * TODO: Implementar comandos ESC/POS específicos para impresoras térmicas
 */
export async function printThermal(
  mainWindow: BrowserWindow | null,
  data: any
): Promise<boolean> {
  try {
    if (!mainWindow) {
      console.error('❌ No hay ventana principal disponible')
      return false
    }

    // TODO: Implementar impresión térmica con formato específico
    // Por ahora solo registra los datos
    console.log('🖨️ Preparando impresión:', data)

    // Opción 1: Usar mainWindow.webContents.print() para impresión básica
    // Opción 2: Implementar comandos ESC/POS para impresoras térmicas Epson
    // Opción 3: Usar librería como 'node-thermal-printer' o 'escpos'

    return true
  } catch (error) {
    console.error('❌ Error al imprimir:', error)
    return false
  }
}
