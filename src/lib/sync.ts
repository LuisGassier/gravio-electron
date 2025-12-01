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
 * Obtener transacciones pendientes de sincronizar desde SQLite
 */
async function getPendingTransactions() {
  if (!window.electron) return []
  
  try {
    const result = await window.electron.db.query(
      'SELECT * FROM registros WHERE sincronizado = 0 ORDER BY fecha_registro ASC',
      []
    )
    return result
  } catch (error) {
    console.error('❌ Error al obtener transacciones pendientes:', error)
    return []
  }
}

/**
 * Convertir timestamp Unix (segundos) a ISO string para Supabase
 */
function unixToISO(timestamp: number | null | undefined): string | null {
  if (!timestamp) return null
  return new Date(timestamp * 1000).toISOString()
}

/**
 * Sincronizar una transacción a Supabase
 */
async function syncTransaction(transaction: any) {
  // Si no hay supabase configurado, marcar como sincronizado localmente
  if (!supabase) {
    console.warn('⚠️ Supabase no configurado, transacción solo en local')
    await window.electron.db.query(
      'UPDATE registros SET sincronizado = 1 WHERE id = ?',
      [transaction.id]
    )
    return true
  }

  // Verificar autenticación antes de sincronizar
  if (!syncStatus.isAuthenticated) {
    console.warn('⚠️ Usuario no autenticado, transacción pendiente')
    return false
  }
  
  try {
    // Convertir datos de SQLite (integers/booleans) a formato Supabase (timestamptz/booleans)
    const supabaseData = {
      id: transaction.id,
      clave_ruta: transaction.clave_ruta || null,
      placa_vehiculo: transaction.placa_vehiculo,
      numero_economico: transaction.numero_economico || null,
      clave_operador: transaction.clave_operador || null,
      operador: transaction.operador || null,
      ruta: transaction.ruta || null,
      peso: transaction.peso ? parseFloat(transaction.peso) : null,
      peso_entrada: transaction.peso_entrada ? parseFloat(transaction.peso_entrada) : null,
      peso_salida: transaction.peso_salida ? parseFloat(transaction.peso_salida) : null,
      fecha_entrada: unixToISO(transaction.fecha_entrada),
      fecha_salida: unixToISO(transaction.fecha_salida),
      fecha_registro: unixToISO(transaction.fecha_registro) || new Date().toISOString(),
      tipo_pesaje: transaction.tipo_pesaje || 'entrada',
      folio: transaction.folio || null,
      clave_concepto: transaction.clave_concepto || null,
      concepto_id: transaction.concepto_id || null,
      clave_empresa: transaction.clave_empresa || null,
      observaciones: transaction.observaciones || null,
      sincronizado: true, // Supabase usa boolean
    }

    const { error } = await supabase
      .from('registros')
      .upsert(supabaseData)
    
    if (error) {
      // Si la tabla no existe (42P01 = tabla no existe, PGRST116 = no encontrado)
      if (error.code === '42P01' || error.code === 'PGRST116' || (error as any).message?.includes('does not exist')) {
        console.warn('⚠️ Tabla "registros" no existe en Supabase. Mantiendo transacción en local.')
        return true // No reintentar si la tabla no existe
      }
      throw error
    }
    
    // Marcar como sincronizado en SQLite
    await window.electron.db.query(
      'UPDATE registros SET sincronizado = 1 WHERE id = ?',
      [transaction.id]
    )
    
    console.log('✅ Transacción sincronizada:', transaction.id)
    return true
  } catch (error) {
    console.error('❌ Error al sincronizar transacción:', error)
    return false
  }
}

/**
 * Sincronizar todas las transacciones pendientes
 */
async function syncTransactions() {
  const pending = await getPendingTransactions()
  
  if (pending.length === 0) {
    console.log('✅ No hay transacciones pendientes')
    return
  }
  
  console.log(`🔄 Sincronizando ${pending.length} transacciones...`)
  
  let successCount = 0
  const errors: string[] = []
  
  for (const transaction of pending) {
    const success = await syncTransaction(transaction)
    if (success) {
      successCount++
    } else {
      errors.push(`Error en transacción ${transaction.id}`)
    }
  }
  
  console.log(`✅ Sincronizadas ${successCount}/${pending.length} transacciones`)
  
  syncStatus.errors = errors
  syncStatus.pendingItems = pending.length - successCount
}

/**
 * Descargar datos de Supabase a cache local (vehículos, usuarios, etc.)
 */
async function downloadCacheData() {
  // Si no hay supabase configurado, skip
  if (!supabase) {
    console.log('⚠️ Supabase no configurado, omitiendo descarga de cache')
    return
  }

  // Verificar autenticación
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
