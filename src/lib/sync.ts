/**
 * Sync.ts - Wrapper de compatibilidad que usa Clean Architecture
 * Mantiene la API legacy mientras delega al nuevo SyncService
 */

import { container } from '@/application'
import { supabase, restoreSession } from './supabase'

// Re-exportar funciones de autenticación para facilitar el acceso
export { authenticateUser, signOut, getCurrentUserId } from './supabase'

// Estado de sincronización
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
 * Obtener transacciones pendientes de sincronizar (usa nuevo repository)
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
 * Sincronizar todas las transacciones pendientes (usa SyncService)
 * La lógica de sincronización ahora está en SyncService y SupabaseRegistroRepository
 */
async function syncTransactions() {
  const result = await container.syncService.syncNow()
  
  console.log(`✅ Sincronizadas ${result.synced} transacciones`)
  syncStatus.errors = result.errors.map(e => e.error)
  syncStatus.pendingItems = result.failed
}

/**
 * Descargar datos de Supabase a cache local
 * TODO: Migrar a usar repositorios cuando estén implementados
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
  
  try {
    // Descargar empresas primero (requerido para las relaciones)
    const { data: empresas, error: empresasError } = await supabase
      .from('empresa')
      .select('*')
      .limit(1000)
    
    if (empresasError) {
      if (empresasError.code === '42P01' || empresasError.code === 'PGRST116' || empresasError.message.includes('does not exist')) {
        console.warn('⚠️ Tabla "empresa" no existe en Supabase.')
      } else {
        console.error('❌ Error al descargar empresas:', empresasError)
      }
    } else if (empresas && empresas.length > 0) {
      for (const empresa of empresas) {
        await window.electron.db.query(
          `INSERT OR REPLACE INTO empresa (id, empresa, clave_empresa, prefijo) 
           VALUES (?, ?, ?, ?)`,
          [empresa.id, empresa.empresa, empresa.clave_empresa, empresa.prefijo]
        )
      }
      console.log(`✅ Descargadas ${empresas.length} empresas`)
    }

    // Descargar vehículos (tabla 'vehiculos' en Supabase)
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehiculos')
      .select('*')
      .limit(1000)
    
    if (vehiclesError) {
      // Si la tabla no existe (42P01 = tabla no existe, PGRST116 = no encontrado)
      if (vehiclesError.code === '42P01' || vehiclesError.code === 'PGRST116' || vehiclesError.message.includes('does not exist')) {
        console.warn('⚠️ Tabla "vehiculos" no existe en Supabase. Crea la tabla o ignora esta advertencia.')
      } else {
        console.error('❌ Error al descargar vehículos:', vehiclesError)
      }
    } else if (vehicles && vehicles.length > 0) {
      for (const vehicle of vehicles) {
        await window.electron.db.query(
          `INSERT OR REPLACE INTO vehiculos (id, no_economico, placas, clave_empresa, created_at) 
           VALUES (?, ?, ?, ?, ?)`,
          [vehicle.id, vehicle.no_economico, vehicle.placas, vehicle.clave_empresa, vehicle.created_at || Date.now()]
        )
      }
      console.log(`✅ Descargados ${vehicles.length} vehículos`)
    }
    
    // Descargar operadores (tabla 'operadores' en Supabase)
    const { data: operadores, error: operadoresError } = await supabase
      .from('operadores')
      .select('*')
      .limit(1000)
    
    if (operadoresError) {
      if (operadoresError.code === '42P01' || operadoresError.code === 'PGRST116' || operadoresError.message.includes('does not exist')) {
        console.warn('⚠️ Tabla "operadores" no existe en Supabase.')
      } else {
        console.error('❌ Error al descargar operadores:', operadoresError)
      }
    } else if (operadores && operadores.length > 0) {
      for (const operador of operadores) {
        await window.electron.db.query(
          `INSERT OR REPLACE INTO operadores (id, operador, clave_operador, created_at) 
           VALUES (?, ?, ?, ?)`,
          [operador.id, operador.operador, operador.clave_operador, operador.created_at || Date.now()]
        )
      }
      console.log(`✅ Descargados ${operadores.length} operadores`)
    }

    // Descargar relación operadores_empresas
    const { data: operadoresEmpresas, error: oeError } = await supabase
      .from('operadores_empresas')
      .select('*')
      .limit(5000)
    
    if (oeError) {
      if (oeError.code === '42P01' || oeError.code === 'PGRST116' || oeError.message.includes('does not exist')) {
        console.warn('⚠️ Tabla "operadores_empresas" no existe en Supabase.')
      } else {
        console.error('❌ Error al descargar operadores_empresas:', oeError)
      }
    } else if (operadoresEmpresas && operadoresEmpresas.length > 0) {
      for (const oe of operadoresEmpresas) {
        await window.electron.db.query(
          `INSERT OR REPLACE INTO operadores_empresas (operador_id, clave_empresa) 
           VALUES (?, ?)`,
          [oe.operador_id, oe.clave_empresa]
        )
      }
      console.log(`✅ Descargadas ${operadoresEmpresas.length} relaciones operadores-empresas`)
    }
    
    // Descargar rutas (tabla 'rutas' en Supabase)
    const { data: rutas, error: rutasError } = await supabase
      .from('rutas')
      .select('*')
      .limit(1000)
    
    if (rutasError) {
      if (rutasError.code === '42P01' || rutasError.code === 'PGRST116' || rutasError.message.includes('does not exist')) {
        console.warn('⚠️ Tabla "rutas" no existe en Supabase.')
      } else {
        console.error('❌ Error al descargar rutas:', rutasError)
      }
    } else if (rutas && rutas.length > 0) {
      for (const ruta of rutas) {
        await window.electron.db.query(
          `INSERT OR REPLACE INTO rutas (id, ruta, clave_ruta, clave_empresa) 
           VALUES (?, ?, ?, ?)`,
          [ruta.id, ruta.ruta, ruta.clave_ruta, ruta.clave_empresa]
        )
      }
      console.log(`✅ Descargadas ${rutas.length} rutas`)
    }
    
    // Descargar conceptos (tabla 'conceptos' en Supabase)
    const { data: conceptos, error: conceptosError } = await supabase
      .from('conceptos')
      .select('*')
      .limit(1000)
    
    if (conceptosError) {
      if (conceptosError.code === '42P01' || conceptosError.code === 'PGRST116' || conceptosError.message.includes('does not exist')) {
        console.warn('⚠️ Tabla "conceptos" no existe en Supabase.')
      } else {
        console.error('❌ Error al descargar conceptos:', conceptosError)
      }
    } else if (conceptos && conceptos.length > 0) {
      for (const concepto of conceptos) {
        await window.electron.db.query(
          `INSERT OR REPLACE INTO conceptos (id, nombre, clave_concepto, activo, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [concepto.id, concepto.nombre, concepto.clave_concepto, concepto.activo ?? 1, concepto.created_at || Date.now(), concepto.updated_at || Date.now()]
        )
      }
      console.log(`✅ Descargados ${conceptos.length} conceptos`)
    }

    // Descargar relación conceptos_empresas
    const { data: conceptosEmpresas, error: ceError } = await supabase
      .from('conceptos_empresas')
      .select('*')
      .limit(5000)
    
    if (ceError) {
      if (ceError.code === '42P01' || ceError.code === 'PGRST116' || ceError.message.includes('does not exist')) {
        console.warn('⚠️ Tabla "conceptos_empresas" no existe en Supabase.')
      } else {
        console.error('❌ Error al descargar conceptos_empresas:', ceError)
      }
    } else if (conceptosEmpresas && conceptosEmpresas.length > 0) {
      for (const ce of conceptosEmpresas) {
        await window.electron.db.query(
          `INSERT OR REPLACE INTO conceptos_empresas (concepto_id, clave_empresa) 
           VALUES (?, ?)`,
          [ce.concepto_id, ce.clave_empresa]
        )
      }
      console.log(`✅ Descargadas ${conceptosEmpresas.length} relaciones conceptos-empresas`)
    }
    
    // Descargar usuarios (tabla 'usuarios' en Supabase)
    const { data: users, error: usersError } = await supabase
      .from('usuarios')
      .select('*')
      .limit(1000)
    
    if (usersError) {
      // Si la tabla no existe (42P01 = tabla no existe, PGRST116 = no encontrado)
      if (usersError.code === '42P01' || usersError.code === 'PGRST116' || usersError.message.includes('does not exist')) {
        console.warn('⚠️ Tabla "usuarios" no existe en Supabase. Crea la tabla o ignora esta advertencia.')
      } else {
        console.error('❌ Error al descargar usuarios:', usersError)
      }
    } else if (users && users.length > 0) {
      for (const user of users) {
        await window.electron.db.query(
          `INSERT OR REPLACE INTO usuarios (id, nombre, email, telefono, rol_id, activo, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [user.id, user.nombre, user.email, user.telefono, user.rol_id, user.activo ?? 1, user.created_at || Date.now()]
        )
      }
      console.log(`✅ Descargados ${users.length} usuarios`)
    }
  } catch (error) {
    console.error('❌ Error al descargar datos de cache:', error)
  }
}

/**
 * Realizar sincronización completa
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
    // 1. Subir transacciones pendientes
    await syncTransactions()
    
    // 2. Descargar datos de cache
    await downloadCacheData()
    
    // 3. Actualizar estado
    syncStatus.lastSync = new Date()
    syncStatus.pendingItems = (await getPendingTransactions()).length
    
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
