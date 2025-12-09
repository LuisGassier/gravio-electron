import { contextBridge, ipcRenderer } from 'electron'

// Exponer APIs de forma segura al renderer
contextBridge.exposeInMainWorld('electron', {
  // Info de la app
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPlatform: () => ipcRenderer.invoke('app:getPlatform'),

  // Serial Port (Báscula)
  serialPort: {
    list: () => ipcRenderer.invoke('serial:list'),
    open: (port: string, baudRate: number) => 
      ipcRenderer.invoke('serial:open', port, baudRate),
    close: () => ipcRenderer.invoke('serial:close'),
    read: () => ipcRenderer.invoke('serial:read'),
    getPortInfo: () => ipcRenderer.invoke('serial:getPortInfo'),
    onData: (callback: (data: string) => void) => {
      const listener = (_event: any, data: string) => callback(data);
      ipcRenderer.on('serial:data', listener);
      return () => ipcRenderer.removeListener('serial:data', listener);
    },
  },

  // Printer (Impresora Térmica)
  printer: {
    list: () => ipcRenderer.invoke('printer:list'),
    print: (data: any) => ipcRenderer.invoke('printer:print', data),
  },

  // Database (SQLite Offline)
  db: {
    query: (sql: string, params?: any[]) =>
      ipcRenderer.invoke('db:query', sql, params),
    exec: (sql: string) => ipcRenderer.invoke('db:exec', sql),
    transaction: (queries: Array<{ sql: string; params?: any[] }>) =>
      ipcRenderer.invoke('db:transaction', queries),
    get: (sql: string, params?: any[]) =>
      ipcRenderer.invoke('db:get', sql, params),
    run: (sql: string, params?: any[]) =>
      ipcRenderer.invoke('db:run', sql, params),
    all: (sql: string, params?: any[]) =>
      ipcRenderer.invoke('db:all', sql, params),
    atomicIncrementFolio: (claveEmpresa: number, prefijoEmpresa: string) =>
      ipcRenderer.invoke('db:atomicIncrementFolio', claveEmpresa, prefijoEmpresa),
  },

  // Sync
  sync: {
    start: () => ipcRenderer.invoke('sync:start'),
    stop: () => ipcRenderer.invoke('sync:stop'),
    getStatus: () => ipcRenderer.invoke('sync:getStatus'),
    onStatusChange: (callback: (status: any) => void) => {
      ipcRenderer.on('sync:statusChange', (_event, status) => callback(status))
    },
  },

  // Storage (archivos locales)
  storage: {
    get: (key: string) => ipcRenderer.invoke('storage:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('storage:set', key, value),
    delete: (key: string) => ipcRenderer.invoke('storage:delete', key),
    clear: () => ipcRenderer.invoke('storage:clear'),
  },

  // Updater (Auto-update con GitHub Releases)
  updater: {
    check: () => ipcRenderer.invoke('updater:check'),
    download: () => ipcRenderer.invoke('updater:download'),
    installAndRestart: () => ipcRenderer.invoke('updater:installAndRestart'),
    openExternal: (url: string) => ipcRenderer.invoke('updater:openExternal', url),
    onUpdateAvailable: (callback: (info: any) => void) => {
      const listener = (_event: any, info: any) => callback(info)
      ipcRenderer.on('update-available', listener)
      return () => ipcRenderer.removeListener('update-available', listener)
    },
    onDownloadProgress: (callback: (progress: any) => void) => {
      const listener = (_event: any, progress: any) => callback(progress)
      ipcRenderer.on('update-download-progress', listener)
      return () => ipcRenderer.removeListener('update-download-progress', listener)
    },
    onUpdateDownloaded: (callback: (info: any) => void) => {
      const listener = (_event: any, info: any) => callback(info)
      ipcRenderer.on('update-downloaded', listener)
      return () => ipcRenderer.removeListener('update-downloaded', listener)
    },
  },

  // Export (Exportar datos)
  export: {
    toExcel: (tableName?: string) => ipcRenderer.invoke('export:toExcel', tableName),
  },
})

// Types para TypeScript
export type ElectronAPI = {
  getVersion: () => Promise<string>
  getPlatform: () => Promise<string>
  serialPort: {
    list: () => Promise<{ success: boolean; ports?: Array<{ path: string; manufacturer?: string }>; error?: string }>
    open: (port: string, baudRate: number) => Promise<{ success: boolean; error?: string }>
    close: () => Promise<{ success: boolean; error?: string }>
    read: () => Promise<string>
    getPortInfo: () => Promise<{ path: string; baudRate: number; isOpen: boolean } | null>
    onData: (callback: (data: string) => void) => () => void
  }
  printer: {
    list: () => Promise<Array<{ name: string; displayName: string }>>
    print: (data: any) => Promise<boolean>
  }
  db: {
    query: (sql: string, params?: any[]) => Promise<any[]>
    exec: (sql: string) => Promise<void>
    transaction: (queries: Array<{ sql: string; params?: any[] }>) => Promise<void>
    get: (sql: string, params?: any[]) => Promise<any | undefined>
    run: (sql: string, params?: any[]) => Promise<void>
    all: (sql: string, params?: any[]) => Promise<any[]>
    atomicIncrementFolio: (claveEmpresa: number, prefijoEmpresa: string) => Promise<{
      folio: string
      ultimoNumero: number
    }>
  }
  sync: {
    start: () => Promise<void>
    stop: () => Promise<void>
    getStatus: () => Promise<any>
    onStatusChange: (callback: (status: any) => void) => void
  }
  storage: {
    get: (key: string) => Promise<any>
    set: (key: string, value: any) => Promise<void>
    delete: (key: string) => Promise<void>
    clear: () => Promise<void>
  }
  updater: {
    check: () => Promise<any>
    download: () => Promise<any>
    installAndRestart: () => Promise<void>
    openExternal: (url: string) => Promise<void>
    onUpdateAvailable: (callback: (info: any) => void) => () => void
    onDownloadProgress: (callback: (progress: any) => void) => () => void
    onUpdateDownloaded: (callback: (info: any) => void) => () => void
  }
  export: {
    toExcel: (tableName?: string) => Promise<{
      success: boolean
      message: string
      filePath?: string
    }>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}
