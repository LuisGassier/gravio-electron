/**
 * Sync.ts - Módulo de sincronización usando Clean Architecture
 * Orquesta la sincronización entre SQLite local y Supabase usando SyncService
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
const SYNC_INTERVAL = 30 * 60 * 1000 // 30 minutos (optimizado para reducir egress)

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
 * Descargar registros actualizados de Supabase a SQLite local
 * Esto permite ver cambios hechos en otras PCs (como registros de salida)
 * @param forceFullSync Si es true, descarga registros de las últimas 7 días en lugar de solo desde la última sync
 */
export async function downloadRegistros(forceFullSync = false) {
  if (!supabase) return

  try {
    // PASO 1: Obtener IDs de registros pendientes localmente
    const pendingLocalIds: string[] = []
    if (window.electron) {
      const pendingLocal = await window.electron.db.all(
        'SELECT id FROM registros WHERE peso_salida IS NULL AND fecha_salida IS NULL'
      )
      pendingLocalIds.push(...pendingLocal.map((r: any) => r.id))
    }

    // PASO 2: Descargar registros actualizados recientemente
    const lastSyncKey = 'lastRegistrosSync'
    const lastSync = localStorage.getItem(lastSyncKey)

    // Si forceFullSync es true, descargar últimos 7 días para asegurar que obtenemos todo
    // Si no, solo descargar desde la última sincronización (más eficiente)
    const sinceDate = forceFullSync
      ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 días
      : (lastSync ? new Date(lastSync) : new Date(Date.now() - 2 * 60 * 60 * 1000)) // Solo últimas 2 horas por defecto

    const { data: registros, error } = await supabase
      .from('registros')
      .select('*')
      .gte('updated_at', sinceDate.toISOString())
      .order('updated_at', { ascending: false })
      .limit(forceFullSync ? 500 : 50) // 50 en sync normal, 500 en full sync

    if (error) {
      console.error('❌ Error al descargar registros:', error)
      return
    }

    let allRegistros = registros || []

    // PASO 3: Buscar específicamente los registros pendientes localmente en Supabase
    // para ver si tienen salida registrada en otra PC
    if (pendingLocalIds.length > 0) {
      // Supabase tiene un límite de elementos en el filtro 'in', así que procesamos en lotes
      const batchSize = 100
      for (let i = 0; i < pendingLocalIds.length; i += batchSize) {
        const batch = pendingLocalIds.slice(i, i + batchSize)
        const { data: pendingInSupabase, error: pendingError } = await supabase
          .from('registros')
          .select('*')
          .in('id', batch)

        if (!pendingError && pendingInSupabase) {
          // Agregar solo los que no estén ya en la lista de registros descargados
          const existingIds = new Set(allRegistros.map((r: any) => r.id))
          const newRegistros = pendingInSupabase.filter((r: any) => !existingIds.has(r.id))
          allRegistros = [...allRegistros, ...newRegistros]
        }
      }
    }

    if (!allRegistros || allRegistros.length === 0) {
      return
    }

    let updated = 0
    let skipped = 0

    for (const reg of allRegistros) {
      try {
        const localResult = await window.electron.db.get(
          `SELECT * FROM registros WHERE id = ?`,
          [reg.id]
        )

        if (localResult) {
          // 🔥 REGLA 0 (PRIORIDAD MÁXIMA): Si Supabase tiene salida y local NO, SIEMPRE actualizar
          // Esto es crítico para sincronizar salidas registradas en otras PCs
          if (reg.peso_salida && reg.fecha_salida && !localResult.peso_salida && !localResult.fecha_salida) {
            // Continuar a la actualización (no hacer continue aquí)
          } else {
            // Contar campos críticos llenos en cada versión
            const localFilledFields = [
              localResult.peso_entrada,
              localResult.peso_salida,
              localResult.fecha_entrada,
              localResult.fecha_salida,
              localResult.placa_vehiculo,
              localResult.operador,
              localResult.ruta
            ].filter(field => field !== null && field !== undefined && field !== '').length

            const remoteFilledFields = [
              reg.peso_entrada,
              reg.peso_salida,
              reg.fecha_entrada,
              reg.fecha_salida,
              reg.placa_vehiculo,
              reg.operador,
              reg.ruta
            ].filter(field => field !== null && field !== undefined && field !== '').length

            // ✅ REGLA 1: Si local tiene MÁS campos llenos, proteger
            if (localFilledFields > remoteFilledFields) {
              skipped++
              continue
            }

            // ✅ REGLA 2: Si tienen la misma cantidad de campos, verificar updated_at
            if (localFilledFields === remoteFilledFields) {
              const localUpdatedAt = new Date(localResult.updated_at).getTime()
              const remoteUpdatedAt = new Date(reg.updated_at).getTime()

              if (localUpdatedAt > remoteUpdatedAt) {
                skipped++
                continue
              }

              // Si son iguales en fecha pero local tiene cambios sin sincronizar, proteger
              if (localUpdatedAt === remoteUpdatedAt && localResult.sincronizado === 0) {
                skipped++
                continue
              }
            }
          }
        }

        // ✅ Actualizar con datos de Supabase (es más completo, más reciente, o no existe local)
        await window.electron.db.run(
          `INSERT OR REPLACE INTO registros (
            id, folio, clave_ruta, ruta, placa_vehiculo, numero_economico,
            clave_operador, operador, clave_empresa, clave_concepto, concepto_id,
            peso_entrada, peso_salida, fecha_entrada, fecha_salida,
            tipo_pesaje, observaciones, sincronizado, fecha_registro, created_at, updated_at, registrado_por
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            reg.id,
            reg.folio,
            reg.clave_ruta,
            reg.ruta,
            reg.placa_vehiculo,
            reg.numero_economico,
            reg.clave_operador,
            reg.operador,
            reg.clave_empresa,
            reg.clave_concepto,
            reg.concepto_id,
            reg.peso_entrada,
            reg.peso_salida,
            reg.fecha_entrada,
            reg.fecha_salida,
            reg.tipo_pesaje,
            reg.observaciones,
            reg.sincronizado !== undefined ? (reg.sincronizado ? 1 : 0) : 1,
            reg.fecha_registro || reg.created_at,
            reg.created_at,
            reg.updated_at || new Date().toISOString(),
            reg.registrado_por || null
          ]
        )
        updated++
      } catch (err) {
        console.error(`❌ Error al actualizar registro ${reg.id}:`, err)
      }
    }

    if (updated > 0 || skipped > 0) {
      localStorage.setItem('lastRegistrosSync', new Date().toISOString())
    }
  } catch (error) {
    console.error('❌ Error al descargar registros:', error)
  }
}

/**
 * Descargar datos de Supabase a cache local
 * Usa queries directos a Supabase para cachear datos de catálogos
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
    // 🔄 PRIMERO: Sincronizar registros actualizados (salidas registradas en otras PCs)
    // Usar try-catch individual para evitar que un error detenga todo el proceso
    try {
      await downloadRegistros()
    } catch (error) {
      console.error('❌ Error al descargar registros (continuando con catálogos):', error)
      // No lanzar el error, continuar con los catálogos
    }

    // Obtener timestamps de última descarga de catálogos
    const lastEmpresasSync = localStorage.getItem('lastEmpresasSync')
    const lastVehiculosSync = localStorage.getItem('lastVehiculosSync')
    const lastOperadoresSync = localStorage.getItem('lastOperadoresSync')
    const lastRutasSync = localStorage.getItem('lastRutasSync')
    const lastConceptosSync = localStorage.getItem('lastConceptosSync')

    // Solo descargar catálogos si no se han descargado en la última hora
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    // Descargar empresas solo si es necesario
    if (!lastEmpresasSync || lastEmpresasSync < oneHourAgo) {
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
        localStorage.setItem('lastEmpresasSync', new Date().toISOString())
      }
    }

    // Descargar vehículos solo si es necesario
    if (!lastVehiculosSync || lastVehiculosSync < oneHourAgo) {
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehiculos')
        .select('*')
        .limit(1000)

      if (vehiclesError) {
        if (vehiclesError.code === '42P01' || vehiclesError.code === 'PGRST116' || vehiclesError.message.includes('does not exist')) {
          console.warn('⚠️ Tabla "vehiculos" no existe en Supabase.')
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
        localStorage.setItem('lastVehiculosSync', new Date().toISOString())
      }
    }

    // Descargar operadores solo si es necesario
    if (!lastOperadoresSync || lastOperadoresSync < oneHourAgo) {
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
        localStorage.setItem('lastOperadoresSync', new Date().toISOString())
      }
    }

    // Descargar relación operadores_empresas
    try {
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
    } catch (error) {
      console.error('❌ Error al sincronizar operadores_empresas (continuando):', error)
      // No interrumpir el flujo por este error
    }
    
    // Descargar rutas solo si es necesario
    if (!lastRutasSync || lastRutasSync < oneHourAgo) {
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
        localStorage.setItem('lastRutasSync', new Date().toISOString())
      }
    }

    // Descargar conceptos solo si es necesario
    if (!lastConceptosSync || lastConceptosSync < oneHourAgo) {
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
        localStorage.setItem('lastConceptosSync', new Date().toISOString())
      }
    }

    // Descargar relación conceptos_empresas
    try {
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
    } catch (error) {
      console.error('❌ Error al sincronizar conceptos_empresas (continuando):', error)
      // No interrumpir el flujo por este error
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
 * Verificar si la sincronización automática está habilitada
 */
export function isAutoSyncEnabled(): boolean {
  const enabled = localStorage.getItem('autoSyncEnabled')
  return enabled === null ? false : enabled === 'true' // Por defecto: DESACTIVADO
}

/**
 * Habilitar/deshabilitar sincronización automática
 */
export function setAutoSyncEnabled(enabled: boolean) {
  localStorage.setItem('autoSyncEnabled', enabled.toString())

  if (enabled) {
    if (!syncInterval && syncStatus.isOnline) {
      startAutoSync()
      console.log('✅ Sincronización automática habilitada')
    }
  } else {
    if (syncInterval) {
      stopAutoSync()
      console.log('⏹️ Sincronización automática deshabilitada')
    }
  }
}

/**
 * Actualizar el timestamp de última sincronización (llamado desde SyncService)
 */
export function updateLastSyncTimestamp(lastSync: Date) {
  syncStatus.lastSync = lastSync
  notifyStatusChange()
}

/**
 * Inicializar sincronización
 */
export async function initSync() {
  // Actualizar estado inicial de conexión
  syncStatus.isOnline = navigator.onLine

  // Registrar callback para que SyncService actualice nuestro estado
  const { registerGlobalSyncUpdate } = await import('@/application/services/SyncService')
  registerGlobalSyncUpdate(updateLastSyncTimestamp)

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

  // 🧹 Limpiar registros antiguos si es necesario (evita saturación local)
  try {
    const { shouldCleanup, cleanupOldRecords, getDatabaseStats } = await import('./cleanupDatabase')
    const needsCleanup = await shouldCleanup()

    if (needsCleanup) {
      console.log('🧹 Iniciando limpieza de registros antiguos...')
      const result = await cleanupOldRecords()
      if (result.success && result.deleted > 0) {
        console.log(`✅ Limpiados ${result.deleted} registros antiguos (>30 días)`)
      }
    }

    // Mostrar estadísticas
    const stats = await getDatabaseStats()
    console.log('📊 Estadísticas de base de datos local:', {
      total: stats.totalRecords,
      completos: stats.completedRecords,
      pendientes: stats.pendingRecords,
    })
  } catch (error) {
    console.warn('⚠️ Error en limpieza automática:', error)
  }

  // 📦 Precargar caché de catálogos (empresas y conceptos)
  try {
    const { catalogCache } = await import('./catalogCache')
    await Promise.all([
      catalogCache.preloadEmpresas(),
      catalogCache.preloadConceptos()
    ])
    const cacheStats = catalogCache.getStats()
    console.log(`📦 Caché precargado: ${cacheStats.empresas} empresas, ${cacheStats.conceptos} conceptos (${cacheStats.size})`)
  } catch (error) {
    console.warn('⚠️ Error al precargar caché:', error)
  }

  // Iniciar sincronización automática SOLO si está habilitada
  if (syncStatus.isOnline && isAutoSyncEnabled()) {
    startAutoSync()
    console.log('✅ Sistema de sincronización automática iniciado')
  } else {
    console.log('📋 Sincronización manual activada (auto-sync deshabilitado)')
  }

  console.log('✅ Sistema de sincronización inicializado')
}
