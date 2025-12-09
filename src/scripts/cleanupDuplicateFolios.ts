/**
 * Cleanup script for duplicate folios in local database
 *
 * Strategy:
 * 1. Find all duplicate folios
 * 2. Keep the first registro (by created_at)
 * 3. Mark duplicates as needing new folio (set folio to NULL, sincronizado = 0)
 * 4. On next sync, Supabase will assign new unique folios
 */
export async function cleanupDuplicateFolios(): Promise<{
  found: number
  fixed: number
  errors: string[]
}> {
  const errors: string[] = []
  let found = 0
  let fixed = 0

  try {
    if (!window.electron) {
      throw new Error('Electron API no disponible')
    }

    // Find duplicates
    const duplicatesQuery = `
      SELECT clave_empresa, folio, COUNT(*) as count, GROUP_CONCAT(id) as ids
      FROM registros
      WHERE folio IS NOT NULL
      GROUP BY clave_empresa, folio
      HAVING COUNT(*) > 1
      ORDER BY clave_empresa, folio
    `

    const duplicates = await window.electron.db.all(duplicatesQuery, [])
    found = duplicates.length

    console.log(`🔍 Encontrados ${found} folios duplicados`)

    for (const dup of duplicates) {
      try {
        const ids = dup.ids.split(',')
        console.log(`📋 Folio duplicado: ${dup.folio} (${ids.length} registros)`)

        // Get full registros ordered by created_at
        const placeholders = ids.map(() => '?').join(',')
        const registros = await window.electron.db.all(
          `SELECT * FROM registros WHERE id IN (${placeholders}) ORDER BY created_at ASC`,
          ids
        )

        if (registros.length === 0) {
          continue
        }

        // Keep first (oldest), null out the rest
        const [keep, ...nullOut] = registros

        console.log(`  ✅ Manteniendo: ${keep.id} (${keep.created_at})`)

        for (const registro of nullOut) {
          await window.electron.db.run(
            'UPDATE registros SET folio = NULL, sincronizado = 0, updated_at = ? WHERE id = ?',
            [new Date().toISOString(), registro.id]
          )
          console.log(`  🔄 Marcando para reasignación: ${registro.id}`)
          fixed++
        }
      } catch (error) {
        const msg = `Error procesando folio ${dup.folio}: ${error}`
        console.error(msg)
        errors.push(msg)
      }
    }

    console.log(`✅ Limpieza completada: ${fixed} registros marcados para reasignación`)

    return { found, fixed, errors }
  } catch (error) {
    console.error('❌ Error en limpieza de folios:', error)
    throw error
  }
}
