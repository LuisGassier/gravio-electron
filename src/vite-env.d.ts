/// <reference types="vite/client" />

// Electron API types
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
    list: () => Promise<Array<{
      name: string
      displayName: string
      description?: string
      isDefault?: boolean
    }>>
    print: (data: {
      printerName: string
      folio?: string
      fecha: Date
      companyName?: string
      companyAddress?: string
      companyLogo?: string
      empresaClave: string
      empresaNombre: string
      conceptoClave: string
      conceptoNombre: string
      vehiculo: {
        placas: string
        numeroEconomico: string
      }
      operadorClave: string
      operadorNombre: string
      rutaClave: string
      rutaNombre: string
      pesos: {
        entrada?: number
        salida?: number
        neto?: number
      }
      fechaEntrada?: Date
      fechaSalida?: Date
      observaciones?: string
      usuario?: string
    }) => Promise<boolean>
  }
  db: {
    query: (sql: string, params?: any[]) => Promise<any[]>
    exec: (sql: string) => Promise<void>
    transaction: (queries: Array<{ sql: string; params?: any[] }>) => Promise<void>
    get: (sql: string, params?: any[]) => Promise<any | undefined>
    run: (sql: string, params?: any[]) => Promise<void>
    all: (sql: string, params?: any[]) => Promise<any[]>
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
    downloadAndInstall: (downloadUrl: string, fileName: string) => Promise<void>
    openExternal: (url: string) => Promise<void>
    onProgress: (callback: (progress: number) => void) => void
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}

// Supabase Environment Variables
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_COM_PORT?: string
  readonly VITE_COM_BAUDRATE?: string
  readonly VITE_PRINTER_MODEL?: string
  readonly VITE_APP_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
