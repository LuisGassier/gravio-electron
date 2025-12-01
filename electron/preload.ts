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
    onData: (callback: (data: string) => void) => {
      ipcRenderer.on('serial:data', (_event, data) => callback(data))
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
})

// Types para TypeScript
export type ElectronAPI = {
  getVersion: () => Promise<string>
  getPlatform: () => Promise<string>
  serialPort: {
    list: () => Promise<Array<{ path: string; manufacturer?: string }>>
    open: (port: string, baudRate: number) => Promise<boolean>
    close: () => Promise<void>
    read: () => Promise<string>
    onData: (callback: (data: string) => void) => void
  }
  printer: {
    list: () => Promise<Array<{ name: string; displayName: string }>>
    print: (data: any) => Promise<boolean>
  }
  db: {
    query: (sql: string, params?: any[]) => Promise<any[]>
    exec: (sql: string) => Promise<void>
    transaction: (queries: Array<{ sql: string; params?: any[] }>) => Promise<void>
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
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}
