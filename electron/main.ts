import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
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
  getOne,
  getAll,
  runCommand,
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

// Configuración del auto-updater
autoUpdater.autoDownload = false // No descargar automáticamente
autoUpdater.autoInstallOnAppQuit = true

// Eventos del auto-updater
autoUpdater.on('checking-for-update', () => {
  console.log('🔍 Verificando actualizaciones...')
})

autoUpdater.on('update-available', (info) => {
  console.log('✅ Actualización disponible:', info.version)
  if (mainWindow) {
    mainWindow.webContents.send('update-available', info)
  }
})

autoUpdater.on('update-not-available', () => {
  console.log('✅ La aplicación está actualizada')
})

autoUpdater.on('download-progress', (progressObj) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-download-progress', progressObj)
  }
})

autoUpdater.on('update-downloaded', (info) => {
  console.log('✅ Actualización descargada:', info.version)
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', info)
  }
})

autoUpdater.on('error', (error) => {
  console.error('❌ Error en auto-updater:', error)
})

// App ready
app.whenReady().then(async () => {
  // Inicializar base de datos
  await initDatabase()
  
  createWindow()

  // Registrar IPC Handlers
  registerIpcHandlers()

  // Verificar actualizaciones (solo en producción)
  if (!isDev) {
    setTimeout(() => {
      autoUpdater.checkForUpdates()
    }, 5000) // Esperar 5 segundos después del inicio
  }

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
  
  ipcMain.handle('db:get', (_event, sql: string, params?: any[]) => {
    return getOne(sql, params)
  })
  
  ipcMain.handle('db:run', (_event, sql: string, params?: any[]) => {
    runCommand(sql, params)
    return
  })
  
  ipcMain.handle('db:all', (_event, sql: string, params?: any[]) => {
    return getAll(sql, params)
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

  // Auto-Updater handlers
  ipcMain.handle('updater:check', async () => {
    if (!isDev) {
      return await autoUpdater.checkForUpdates()
    }
    return null
  })

  ipcMain.handle('updater:download', async () => {
    if (!isDev) {
      return await autoUpdater.downloadUpdate()
    }
    return null
  })

  ipcMain.handle('updater:installAndRestart', () => {
    if (!isDev) {
      autoUpdater.quitAndInstall(false, true)
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
