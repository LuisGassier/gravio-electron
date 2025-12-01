import { BrowserWindow } from 'electron'

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

    // Crear ventana oculta para renderizar el ticket
    const workerWindow = new BrowserWindow({
      show: false,
      width: 400, // Ancho aproximado para 80mm
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    // Template HTML básico para ticket de 80mm
    const htmlContent = `
      <html>
      <head>
        <style>
          body { 
            font-family: 'Courier New', monospace; 
            font-size: 14px; 
            font-weight: 900;
            width: 100%; 
            margin: 0; 
            padding: 5px; 
            color: #000000;
            background: white;
          }
          .header { 
            text-align: center; 
            font-weight: 900; 
            font-size: 18px; 
            margin-bottom: 10px; 
          }
          .divider { 
            border-top: 2px dashed #000000; 
            margin: 10px 0; 
          }
          .footer { 
            text-align: center; 
            margin-top: 20px; 
            font-size: 12px; 
            font-weight: 900;
          }
          .content {
            white-space: pre-wrap;
            font-weight: 900;
          }
        </style>
      </head>
      <body>
        <div class="header">GRAVIO</div>
        <div style="text-align: center;">Prueba de Impresión</div>
        <div class="divider"></div>
        <div>Fecha: ${new Date().toLocaleString()}</div>
        <div>Impresora: ${data.printerName}</div>
        <div class="divider"></div>
        <div class="content" style="text-align: center; font-size: 14px;">
          ¡Funciona Correctamente!
          <br/>
          Impresora Térmica Configurada
        </div>
        <div class="divider"></div>
        <div class="footer">Sistema de Gestión de Relleno Sanitario</div>
      </body>
      </html>
    `;

    // Cargar contenido
    await workerWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent));

    // Imprimir
    return new Promise((resolve) => {
      workerWindow.webContents.print({
        silent: true,
        printBackground: false,
        deviceName: data.printerName,
        margins: {
          marginType: 'custom',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
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
        setTimeout(() => workerWindow.close(), 1000);
      });
    });

  } catch (error) {
    console.error('❌ Error al imprimir:', error)
    return false
  }
}
