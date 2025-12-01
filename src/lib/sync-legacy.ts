/**
 * Legacy sync.ts - Wrapper de compatibilidad para la nueva arquitectura
 * Este archivo mantiene la API antigua mientras usa el nuevo SyncService internamente
 * Permite migración gradual sin romper código existente
 */

import { container } from '@/application'
import { supabase, restoreSession } from './supabase'

// Re-exportar funciones de autenticación para facilitar el acceso
export { authenticateUser, signOut, getCurrentUserId } from './supabase'

// Estado de sincronización (mantiene compatibilidad con API legacy)
export type SyncStatus = {
  isOnline: boolean
  isSyncing: boolean
  lastSync: Date | null
  pendingItems: number
  errors: string[]
  isAuthenticated: boolean
}

let syncStatus: SyncStatus = {
  isOnline: navigator.onLine,
  isSyncing: false,
  lastSync: null,
  pendingItems: 0,
  errors: [],
  isAuthenticated: false,
}

let syncInterval: ReturnType<typeof setInterval> | null = null
const SYNC_INTERVAL = 5 * 60 * 1000 // 5 minutos

// Listeners de estado
const statusListeners: Array<(status: SyncStatus) => void> = []

/**
 * Suscribirse a cambios de estado de sincronización
 */
export function onSyncStatusChange(callback: (status: SyncStatus) => void) {
  statusListeners.push(callback)
  return () => {
    const index = statusListeners.indexOf(callback)
    if (index > -1) {
      statusListeners.splice(index, 1)
    }
  }
}

/**
 * Notificar cambios de estado
 */
function notifyStatusChange() {
  statusListeners.forEach(listener => listener({ ...syncStatus }))
}

/**
 * Actualizar estado de conexión
 */
function updateOnlineStatus(isOnline: boolean) {
  syncStatus.isOnline = isOnline
  notifyStatusChange()
  
  if (isOnline) {
    console.log('🌐 Conexión restaurada, iniciando sincronización...')
    syncNow()
  } else {
    console.log('📡 Sin conexión, trabajando offline')
  }
}

// Listeners de conexión
window.addEventListener('online', () => updateOnlineStatus(true))
window.addEventListener('offline', () => updateOnlineStatus(false))

/**
 * Obtener transacciones pendientes (usa nuevo repository)
 */
async function getPendingTransactions() {
  if (!window.electron) return []
  
  try {
    const result = await container.sqliteRegistroRepository.findUnsynchronized()
    if (result.success && result.value) {
      return result.value
    }
    return []
  } catch (error) {
    console.error('❌ Error al obtener transacciones pendientes:', error)
    return []
  }
}

/**
 * Descargar datos de Supabase a cache local
 * TODO: Implementar con repositorios cuando estén disponibles
 */
async function downloadCacheData() {
  if (!supabase) {
    console.log('⚠️ Supabase no configurado, omitiendo descarga de cache')
    return
  }

  if (!syncStatus.isAuthenticated) {
    console.warn('⚠️ Usuario no autenticado. Intentando restaurar sesión...')
    const restored = await restoreSession()
    if (restored) {
      syncStatus.isAuthenticated = true
      notifyStatusChange()
    } else {
      console.warn('⚠️ No se pudo restaurar la sesión. Omitiendo descarga de cache.')
      return
    }
  }
  
  // Por ahora mantener la lógica legacy hasta que los repositorios estén completos
  try {
    const { data: empresas } = await supabase.from('empresa').select('*').limit(1000)
    if (empresas && empresas.length > 0) {
      for (const empresa of empresas) {
        await window.electron.db.run(
          `INSERT OR REPLACE INTO empresa (id, empresa, clave_empresa, prefijo) VALUES (?, ?, ?, ?)`,
          [empresa.id, empresa.empresa, empresa.clave_empresa, empresa.prefijo]
        )
      }
      console.log(`✅ Descargadas ${empresas.length} empresas`)
    }

    const { data: vehiculos } = await supabase.from('vehiculos').select('*').limit(1000)
    if (vehiculos && vehiculos.length > 0) {
      for (const vehiculo of vehiculos) {
        await window.electron.db.run(
          `INSERT OR REPLACE INTO vehiculos (id, no_economico, placas, clave_empresa, created_at) VALUES (?, ?, ?, ?, ?)`,
          [vehiculo.id, vehiculo.no_economico, vehiculo.placas, vehiculo.clave_empresa, vehiculo.created_at || Date.now()]
        )
      }
      console.log(`✅ Descargados ${vehiculos.length} vehículos`)
    }

    const { data: operadores } = await supabase.from('operadores').select('*').limit(1000)
    if (operadores && operadores.length > 0) {
      for (const operador of operadores) {
        await window.electron.db.run(
          `INSERT OR REPLACE INTO operadores (id, operador, clave_operador, created_at) VALUES (?, ?, ?, ?)`,
          [operador.id, operador.operador, operador.clave_operador, operador.created_at || Date.now()]
        )
      }
      console.log(`✅ Descargados ${operadores.length} operadores`)
    }

    const { data: oe } = await supabase.from('operadores_empresas').select('*').limit(5000)
    if (oe && oe.length > 0) {
      for (const rel of oe) {
        await window.electron.db.run(
          `INSERT OR REPLACE INTO operadores_empresas (operador_id, clave_empresa) VALUES (?, ?)`,
          [rel.operador_id, rel.clave_empresa]
        )
      }
      console.log(`✅ Descargadas ${oe.length} relaciones operadores-empresas`)
    }

    const { data: rutas } = await supabase.from('rutas').select('*').limit(1000)
    if (rutas && rutas.length > 0) {
      for (const ruta of rutas) {
        await window.electron.db.run(
          `INSERT OR REPLACE INTO rutas (id, ruta, clave_ruta, clave_empresa) VALUES (?, ?, ?, ?)`,
          [ruta.id, ruta.ruta, ruta.clave_ruta, ruta.clave_empresa]
        )
      }
      console.log(`✅ Descargadas ${rutas.length} rutas`)
    }

    const { data: conceptos } = await supabase.from('conceptos').select('*').limit(1000)
    if (conceptos && conceptos.length > 0) {
      for (const concepto of conceptos) {
        await window.electron.db.run(
          `INSERT OR REPLACE INTO conceptos (id, nombre, clave_concepto, activo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
          [concepto.id, concepto.nombre, concepto.clave_concepto, concepto.activo ?? 1, concepto.created_at || Date.now(), concepto.updated_at || Date.now()]
        )
      }
      console.log(`✅ Descargados ${conceptos.length} conceptos`)
    }

    const { data: ce } = await supabase.from('conceptos_empresas').select('*').limit(5000)
    if (ce && ce.length > 0) {
      for (const rel of ce) {
        await window.electron.db.run(
          `INSERT OR REPLACE INTO conceptos_empresas (concepto_id, clave_empresa) VALUES (?, ?)`,
          [rel.concepto_id, rel.clave_empresa]
        )
      }
      console.log(`✅ Descargadas ${ce.length} relaciones conceptos-empresas`)
    }

    const { data: usuarios } = await supabase.from('usuarios').select('*').limit(1000)
    if (usuarios && usuarios.length > 0) {
      for (const user of usuarios) {
        await window.electron.db.run(
          `INSERT OR REPLACE INTO usuarios (id, nombre, email, telefono, rol_id, activo, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [user.id, user.nombre, user.email, user.telefono, user.rol_id, user.activo ?? 1, user.created_at || Date.now()]
        )
      }
      console.log(`✅ Descargados ${usuarios.length} usuarios`)
    }
  } catch (error) {
    console.error('❌ Error al descargar datos de cache:', error)
  }
}

/**
 * Realizar sincronización completa (usa nuevo SyncService)
 */
export async function syncNow() {
  if (!syncStatus.isOnline) {
    console.log('📡 Sin conexión, no se puede sincronizar')
    return
  }
  
  if (syncStatus.isSyncing) {
    console.log('⏳ Ya hay una sincronización en curso')
    return
  }
  
  syncStatus.isSyncing = true
  notifyStatusChange()
  
  try {
    // 1. Usar nuevo SyncService para subir registros
    const syncResult = await container.syncService.syncNow()
    
    console.log(`✅ Sincronizadas ${syncResult.synced} transacciones`)
    if (syncResult.errors.length > 0) {
      console.error('❌ Errores en sincronización:', syncResult.errors)
      syncStatus.errors = syncResult.errors.map(e => e.error)
    }
    
    // 2. Descargar datos de cache (por ahora legacy)
    await downloadCacheData()
    
    // 3. Actualizar estado
    syncStatus.lastSync = new Date()
    const pending = await getPendingTransactions()
    syncStatus.pendingItems = pending.length
    
    console.log('✅ Sincronización completada')
  } catch (error) {
    console.error('❌ Error en sincronización:', error)
    syncStatus.errors.push('Error general de sincronización')
  } finally {
    syncStatus.isSyncing = false
    notifyStatusChange()
  }
}

/**
 * Iniciar sincronización automática periódica
 */
export function startAutoSync() {
  if (syncInterval) {
    console.log('⏰ Sincronización automática ya está activa')
    return
  }
  
  console.log(`⏰ Iniciando sincronización automática cada ${SYNC_INTERVAL / 1000 / 60} minutos`)
  
  // Sincronizar inmediatamente
  syncNow()
  
  // Programar sincronizaciones periódicas
  syncInterval = setInterval(() => {
    if (syncStatus.isOnline) {
      syncNow()
    }
  }, SYNC_INTERVAL)
}

/**
 * Detener sincronización automática
 */
export function stopAutoSync() {
  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = null
    console.log('⏹️ Sincronización automática detenida')
  }
}

/**
 * Obtener estado actual de sincronización
 */
export function getSyncStatus(): SyncStatus {
  return { ...syncStatus }
}

/**
 * Inicializar sincronización
 */
export async function initSync() {
  // Actualizar estado inicial de conexión
  syncStatus.isOnline = navigator.onLine
  
  // Intentar restaurar sesión guardada
  if (supabase) {
    const restored = await restoreSession()
    syncStatus.isAuthenticated = restored
    if (restored) {
      console.log('✅ Sesión de usuario restaurada')
    } else {
      console.warn('⚠️ No hay sesión guardada. Inicia sesión para sincronizar con Supabase.')
    }
  }
  
  // Iniciar sincronización automática si hay conexión
  if (syncStatus.isOnline) {
    startAutoSync()
  }
  
  console.log('✅ Sistema de sincronización inicializado')
}
