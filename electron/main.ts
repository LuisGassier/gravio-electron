import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import Store from 'electron-store'
import fs from 'fs'
import https from 'https'
import { exec } from 'child_process'

// Importar módulos
import {
  initDatabase,
  closeDatabase,
  executeQuery,
  executeCommand,
  executeTransaction,
} from './database'

import {
  listSerialPorts,
  openSerialPort,
  closeSerialPort,
  readCurrentWeight,
  isPortOpen,
  getPortInfo,
} from './serialport'

import {
  listPrinters,
  printThermal,
} from './printer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Variables globales
let mainWindow: BrowserWindow | null = null
const store = new Store()

// Constantes
const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Necesario para serialport y sqlite
    },
    title: 'Gravio - Sistema de Relleno Sanitario',
    icon: path.join(__dirname, '../public/icon.png'),
    autoHideMenuBar: !isDev,
  })

  // Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          isDev
            ? "default-src 'self'; script-src 'self' 'unsafe-inline' http://localhost:*; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co http://localhost:* ws://localhost:*; font-src 'self' data:;"
            : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; font-src 'self' data:;"
        ]
      }
    })
  })

  // Cargar la app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// App ready
app.whenReady().then(async () => {
  // Inicializar base de datos
  await initDatabase()
  
  createWindow()

  // Registrar IPC Handlers
  registerIpcHandlers()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Cerrar app en Windows/Linux
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Cleanup antes de cerrar
app.on('before-quit', async () => {
  await closeSerialPort()
  closeDatabase()
})

// Registrar todos los IPC Handlers
function registerIpcHandlers() {
  // App info
  ipcMain.handle('app:getVersion', () => app.getVersion())
  ipcMain.handle('app:getPlatform', () => process.platform)

  // Serial Port (Báscula)
  ipcMain.handle('serial:list', listSerialPorts)
  
  ipcMain.handle('serial:open', async (_event, port: string, baudRate: number) => {
    const success = await openSerialPort(port, baudRate, (weight) => {
      // Enviar datos al renderer cuando se reciban
      if (mainWindow) {
        mainWindow.webContents.send('serial:data', weight.toString())
      }
    })
    return success
  })
  
  ipcMain.handle('serial:close', closeSerialPort)
  ipcMain.handle('serial:read', readCurrentWeight)
  ipcMain.handle('serial:getPortInfo', getPortInfo)

  // Database (SQLite)
  ipcMain.handle('db:query', (_event, sql: string, params?: any[]) => {
    return executeQuery(sql, params)
  })
  
  ipcMain.handle('db:exec', (_event, sql: string) => {
    return executeCommand(sql)
  })
  
  ipcMain.handle('db:transaction', (_event, queries: Array<{ sql: string; params?: any[] }>) => {
    return executeTransaction(queries)
  })

  // Printer (Impresora Térmica)
  ipcMain.handle('printer:list', () => listPrinters(mainWindow))
  ipcMain.handle('printer:print', (_event, data: any) => printThermal(mainWindow, data))

  // Sync - TODO: implementar lógica completa
  ipcMain.handle('sync:start', async () => {
    console.log('🔄 Iniciando sincronización...')
  })
  
  ipcMain.handle('sync:stop', async () => {
    console.log('⏸️ Deteniendo sincronización...')
  })
  
  ipcMain.handle('sync:getStatus', async () => {
    return {
      isOnline: true,
      lastSync: null,
      pendingItems: 0,
    }
  })

  // Storage (electron-store)
  ipcMain.handle('storage:get', (_event, key: string) => {
    return store.get(key)
  })
  
  ipcMain.handle('storage:set', (_event, key: string, value: any) => {
    store.set(key, value)
  })
  
  ipcMain.handle('storage:delete', (_event, key: string) => {
    store.delete(key)
  })
  
  ipcMain.handle('storage:clear', () => {
    store.clear()
  })

  // Updater - Descargar e instalar actualización
  ipcMain.handle('updater:downloadAndInstall', async (_event, downloadUrl: string, fileName: string) => {
    try {
      const downloadsPath = app.getPath('downloads')
      const filePath = path.join(downloadsPath, fileName)
      
      // Verificar si ya existe el archivo
      if (fs.existsSync(filePath)) {
        // Si ya existe, ejecutar directamente
        return await executeInstaller(filePath)
      }

      // Descargar el archivo
      await downloadFile(downloadUrl, filePath, (progress) => {
        // Enviar progreso al renderer
        mainWindow?.webContents.send('updater:progress', progress)
      })

      // Ejecutar el instalador
      return await executeInstaller(filePath)
    } catch (error) {
      console.error('Error downloading/installing update:', error)
      throw error
    }
  })

  // Abrir URL en el navegador externo
  ipcMain.handle('updater:openExternal', async (_event, url: string) => {
    await shell.openExternal(url)
  })
}

/**
 * Descarga un archivo desde una URL
 */
function downloadFile(url: string, destination: string, onProgress?: (progress: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination)
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`))
        return
      }

      const totalSize = parseInt(response.headers['content-length'] || '0', 10)
      let downloadedSize = 0

      response.on('data', (chunk) => {
        downloadedSize += chunk.length
        if (onProgress && totalSize > 0) {
          const progress = Math.round((downloadedSize / totalSize) * 100)
          onProgress(progress)
        }
      })

      response.pipe(file)

      file.on('finish', () => {
        file.close()
        resolve()
      })
    }).on('error', (err) => {
      fs.unlink(destination, () => {}) // Eliminar archivo parcial
      reject(err)
    })

    file.on('error', (err) => {
      fs.unlink(destination, () => {})
      reject(err)
    })
  })
}

/**
 * Ejecuta el instalador y cierra la aplicación
 */
async function executeInstaller(installerPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Ejecutar el instalador
    exec(`"${installerPath}"`, (error) => {
      if (error) {
        reject(error)
        return
      }
      
      // Cerrar la aplicación después de iniciar el instalador
      setTimeout(() => {
        app.quit()
      }, 1000)
      
      resolve()
    })
  })
}

// Prevenir múltiples instancias
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}
