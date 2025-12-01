import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import Store from 'electron-store'

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
} from './serialport'

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
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Necesario para serialport y sqlite
    },
    title: 'Gravio - Sistema de Relleno Sanitario',
    icon: path.join(__dirname, '../public/icon.png'),
    autoHideMenuBar: !isDev,
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
app.whenReady().then(() => {
  // Inicializar base de datos
  initDatabase()
  
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

  // Printer (Impresora Térmica) - TODO: implementar
  ipcMain.handle('printer:list', async () => {
    // Por ahora retorna vacío, implementar según hardware
    return []
  })
  
  ipcMain.handle('printer:print', async (_event, data: any) => {
    // TODO: Implementar impresión térmica
    console.log('🖨️ Imprimiendo:', data)
    return true
  })

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
