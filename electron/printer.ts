import { BrowserWindow } from 'electron'
import { generateTicketHTML } from './ticketTemplate'

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
export async function listPrinters(mainWindow: BrowserWindow | null): Promise<PrinterInfo[]> {
  console.log('📞 listPrinters() llamada - mainWindow:', mainWindow ? 'disponible' : 'NULL')

  try {
    if (!mainWindow) {
      console.warn('⚠️ No hay ventana principal disponible')
      return []
    }

    console.log('🔍 Obteniendo impresoras del sistema...')

    // Obtener impresoras del sistema usando Electron API
    // getPrinters() fue eliminado en Electron recientes, usar getPrintersAsync()
    const printers = await (mainWindow.webContents as any).getPrintersAsync()

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
 * Usa una ventana oculta para renderizar HTML y enviarlo al driver de la impresora
 */
export async function printThermal(
  mainWindow: BrowserWindow | null,
  data: any
): Promise<boolean> {
  try {
    console.log('🖨️ Preparando impresión térmica:', data)

    if (!data.printerName) {
      console.error('❌ No se especificó nombre de impresora')
      return false
    }

    // Crear ventana oculta para renderizar el ticket
    const workerWindow = new BrowserWindow({
      show: false,
      width: 302, // 80mm ≈ 302px @ 96 DPI
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    // Generar HTML del ticket usando el template
    const htmlContent = generateTicketHTML({
      folio: data.folio || 'PENDIENTE',
      fecha: data.fecha ? new Date(data.fecha) : new Date(),
      companyName: data.companyName,
      companyAddress: data.companyAddress,
      companyLogo: data.companyLogo,
      empresaClave: data.empresaClave || '',
      empresaNombre: data.empresaNombre || 'Sin empresa',
      conceptoClave: data.conceptoClave || '',
      conceptoNombre: data.conceptoNombre || 'Sin concepto',
      vehiculo: {
        placas: data.vehiculo?.placas || '',
        numeroEconomico: data.vehiculo?.numeroEconomico || 'N/A'
      },
      operadorClave: data.operadorClave || '',
      operadorNombre: data.operadorNombre || 'Sin operador',
      rutaClave: data.rutaClave || '',
      rutaNombre: data.rutaNombre || 'Sin ruta',
      pesos: {
        entrada: data.pesos?.entrada,
        salida: data.pesos?.salida,
        neto: data.pesos?.neto
      },
      fechaEntrada: data.fechaEntrada ? new Date(data.fechaEntrada) : undefined,
      fechaSalida: data.fechaSalida ? new Date(data.fechaSalida) : undefined,
      observaciones: data.observaciones,
      usuario: data.usuario
    });

    // Cargar contenido y esperar a que se complete
    await workerWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent));

    // Pequeño delay para asegurar que el contenido se renderice
    await new Promise(resolve => setTimeout(resolve, 500));

    // Imprimir
    return new Promise((resolve) => {
      workerWindow.webContents.print({
        silent: true,
        printBackground: true,
        deviceName: data.printerName,
        pageSize: {
          width: 80000, // 80mm en micrones
          height: 297000 // Largo variable, usar altura estándar
        },
        margins: {
          marginType: 'none'
        }
      }, (success, errorType) => {
        if (!success) {
          console.error('❌ Error de impresión:', errorType);
          resolve(false);
        } else {
          console.log('✅ Impresión enviada exitosamente');
          resolve(true);
        }
        // Cerrar ventana después de un breve delay para asegurar que se envió
        setTimeout(() => {
          try {
            workerWindow.close();
          } catch (e) {
            console.warn('Ventana ya cerrada');
          }
        }, 1000);
      });
    });

  } catch (error) {
    console.error('❌ Error al imprimir:', error)
    return false
  }
}
