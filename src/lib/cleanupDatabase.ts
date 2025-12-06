/**
 * Utilidades para limpiar la base de datos local SQLite
 * Evita saturación de registros antiguos
 */

/**
 * Limpia registros antiguos de la base de datos local
 * Mantiene SOLO registros del día actual y el día anterior
 * Elimina todos los demás registros completos y sincronizados
 */
export async function cleanupOldRecords(): Promise<{
  success: boolean
  deleted: number
  error?: string
}> {
  if (!window.electron) {
    return { success: false, deleted: 0, error: 'Electron no disponible' }
  }

  try {
    // Calcular inicio del día anterior (mantener hoy y ayer)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Convertir a ISO string para comparar con los registros (que están en formato ISO)
    const yesterdayISO = yesterday.toISOString()

    console.log('🧹 Iniciando limpieza de registros antiguos (>2 días)...')
    console.log(`📅 Fecha actual: ${today.toLocaleString('es-MX')}`)
    console.log(`📅 Inicio de ayer: ${yesterday.toLocaleString('es-MX')}`)
    console.log(`⏱️ Timestamp ISO de ayer: ${yesterdayISO}`)

    // DEBUG: Ver muestras de registros y sus timestamps
    const sampleRecords = await window.electron.db.query(
      `SELECT id, fecha_entrada, peso_salida, sincronizado
       FROM registros
       ORDER BY fecha_entrada DESC
       LIMIT 5`
    )
    console.log('📊 Últimos 5 registros (más recientes):', sampleRecords)

    const oldSampleRecords = await window.electron.db.query(
      `SELECT id, fecha_entrada, peso_salida, sincronizado
       FROM registros
       ORDER BY fecha_entrada ASC
       LIMIT 5`
    )
    console.log('📊 Primeros 5 registros (más antiguos):', oldSampleRecords)

    // DEBUG: Ver cuántos cumplen cada condición
    const debugStats = await window.electron.db.get(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN fecha_entrada < ? THEN 1 ELSE 0 END) as older_than_yesterday,
        SUM(CASE WHEN peso_salida IS NOT NULL THEN 1 ELSE 0 END) as with_exit_weight,
        SUM(CASE WHEN sincronizado = 1 THEN 1 ELSE 0 END) as synced,
        SUM(CASE WHEN fecha_entrada < ? AND peso_salida IS NOT NULL THEN 1 ELSE 0 END) as old_and_complete,
        SUM(CASE WHEN fecha_entrada < ? AND peso_salida IS NOT NULL AND sincronizado = 1 THEN 1 ELSE 0 END) as should_delete
      FROM registros
    `, [yesterdayISO, yesterdayISO, yesterdayISO])
    console.log('🔍 Estadísticas de condiciones:', debugStats)

    // 1. Contar registros a eliminar
    const countResult = await window.electron.db.get(
      `SELECT COUNT(*) as count
       FROM registros
       WHERE fecha_entrada < ?
       AND peso_salida IS NOT NULL
       AND sincronizado = 1`,
      [yesterdayISO]
    )

    const recordsToDelete = countResult?.count || 0

    if (recordsToDelete === 0) {
      console.log('✅ No hay registros antiguos para limpiar')
      console.log('ℹ️ Esto puede ser normal si todos los registros son de hoy o ayer')
      return { success: true, deleted: 0 }
    }

    console.log(`📊 Se eliminarán ${recordsToDelete} registros anteriores al ${yesterday.toLocaleDateString('es-MX')}`)

    // 2. Eliminar registros antiguos (solo completos y sincronizados)
    // NO eliminar registros pendientes de salida o sin sincronizar
    await window.electron.db.run(
      `DELETE FROM registros
       WHERE fecha_entrada < ?
       AND peso_salida IS NOT NULL
       AND sincronizado = 1`,
      [yesterdayISO]
    )

    // 3. Optimizar base de datos
    await window.electron.db.run('VACUUM')

    console.log(`✅ Limpiados ${recordsToDelete} registros antiguos`)

    return {
      success: true,
      deleted: recordsToDelete,
    }
  } catch (error) {
    console.error('❌ Error al limpiar registros antiguos:', error)
    return {
      success: false,
      deleted: 0,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Obtiene estadísticas de la base de datos local
 */
export async function getDatabaseStats(): Promise<{
  totalRecords: number
  completedRecords: number
  pendingRecords: number
  syncedRecords: number
  oldestRecord: Date | null
  newestRecord: Date | null
}> {
  if (!window.electron) {
    return {
      totalRecords: 0,
      completedRecords: 0,
      pendingRecords: 0,
      syncedRecords: 0,
      oldestRecord: null,
      newestRecord: null,
    }
  }

  try {
    const stats = await window.electron.db.get(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN peso_salida IS NOT NULL THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN peso_salida IS NULL THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN sincronizado = 1 THEN 1 ELSE 0 END) as synced,
        MIN(fecha_entrada) as oldest,
        MAX(fecha_entrada) as newest
      FROM registros
    `)

    return {
      totalRecords: stats?.total || 0,
      completedRecords: stats?.completed || 0,
      pendingRecords: stats?.pending || 0,
      syncedRecords: stats?.synced || 0,
      oldestRecord: stats?.oldest ? new Date(stats.oldest * 1000) : null,
      newestRecord: stats?.newest ? new Date(stats.newest * 1000) : null,
    }
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error)
    return {
      totalRecords: 0,
      completedRecords: 0,
      pendingRecords: 0,
      syncedRecords: 0,
      oldestRecord: null,
      newestRecord: null,
    }
  }
}

/**
 * Verifica si es necesario limpiar la base de datos
 * @returns true si hay más de 500 registros completos (limpieza más frecuente)
 */
export async function shouldCleanup(): Promise<boolean> {
  const stats = await getDatabaseStats()
  // Limpiar si hay más de 500 registros completos o más de 1000 totales
  return stats.completedRecords > 500 || stats.totalRecords > 1000
}
