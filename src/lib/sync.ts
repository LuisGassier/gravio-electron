import { supabase } from './supabase'

// Estado de sincronización
export type SyncStatus = {
  isOnline: boolean
  isSyncing: boolean
  lastSync: Date | null
  pendingItems: number
  errors: string[]
}

let syncStatus: SyncStatus = {
  isOnline: navigator.onLine,
  isSyncing: false,
  lastSync: null,
  pendingItems: 0,
  errors: [],
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
      'SELECT * FROM transactions WHERE synced = 0 ORDER BY timestamp ASC',
      []
    )
    return result
  } catch (error) {
    console.error('❌ Error al obtener transacciones pendientes:', error)
    return []
  }
}

/**
 * Sincronizar una transacción a Supabase
 */
async function syncTransaction(transaction: any) {
  try {
    const { error } = await supabase
      .from('transactions')
      .upsert({
        id: transaction.id,
        type: transaction.type,
        weight: transaction.weight,
        vehicle_plate: transaction.vehicle_plate,
        driver_name: transaction.driver_name,
        waste_type: transaction.waste_type,
        timestamp: new Date(transaction.timestamp * 1000).toISOString(),
      })
    
    if (error) throw error
    
    // Marcar como sincronizado en SQLite
    await window.electron.db.query(
      'UPDATE transactions SET synced = 1 WHERE id = ?',
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
  try {
    // Descargar vehículos
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*')
      .limit(1000)
    
    if (!vehiclesError && vehicles) {
      for (const vehicle of vehicles) {
        await window.electron.db.query(
          `INSERT OR REPLACE INTO vehicles (id, plate, type, owner, last_updated) 
           VALUES (?, ?, ?, ?, ?)`,
          [vehicle.id, vehicle.plate, vehicle.type, vehicle.owner, Date.now()]
        )
      }
      console.log(`✅ Descargados ${vehicles.length} vehículos`)
    }
    
    // Descargar usuarios
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1000)
    
    if (!usersError && users) {
      for (const user of users) {
        await window.electron.db.query(
          `INSERT OR REPLACE INTO users (id, email, full_name, role, last_updated) 
           VALUES (?, ?, ?, ?, ?)`,
          [user.id, user.email, user.full_name, user.role, Date.now()]
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
export function initSync() {
  // Actualizar estado inicial de conexión
  syncStatus.isOnline = navigator.onLine
  
  // Iniciar sincronización automática si hay conexión
  if (syncStatus.isOnline) {
    startAutoSync()
  }
  
  console.log('✅ Sistema de sincronización inicializado')
}
