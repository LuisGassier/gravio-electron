/**
 * Sincronización de entidades maestras desde Supabase a SQLite
 * Para reflejar cambios realizados en Supabase
 */

import { supabase } from './supabase'

interface SyncResult {
  success: boolean
  synced: number
  errors: string[]
}

/**
 * Sincroniza vehículos desde Supabase a SQLite local
 */
export async function syncVehiculos(): Promise<SyncResult> {
  const result: SyncResult = { success: true, synced: 0, errors: [] }

  try {
    if (!supabase) {
      return { success: false, synced: 0, errors: ['Supabase no configurado'] }
    }

    // Obtener vehículos de Supabase
    const { data, error } = await supabase
      .from('vehiculos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      result.success = false
      result.errors.push(`Error al obtener vehículos: ${error.message}`)
      return result
    }

    if (!data || data.length === 0) {
      return result
    }

    // Insertar/actualizar en SQLite local
    for (const vehiculo of data) {
      try {
        await window.electron.db.run(
          `INSERT OR REPLACE INTO vehiculos (id, no_economico, placas, clave_empresa, created_at)
           VALUES (?, ?, ?, ?, ?)`,
          [
            vehiculo.id,
            vehiculo.no_economico,
            vehiculo.placas,
            vehiculo.clave_empresa,
            vehiculo.created_at,
          ]
        )
        result.synced++
      } catch (err) {
        result.errors.push(`Error al guardar vehículo ${vehiculo.id}: ${err}`)
      }
    }


  } catch (error) {
    result.success = false
    result.errors.push(`Error general: ${error}`)
  }

  return result
}

/**
 * Sincroniza operadores desde Supabase a SQLite local
 */
export async function syncOperadores(): Promise<SyncResult> {
  const result: SyncResult = { success: true, synced: 0, errors: [] }

  try {
    if (!supabase) {
      return { success: false, synced: 0, errors: ['Supabase no configurado'] }
    }

    // Obtener operadores de Supabase
    const { data, error } = await supabase
      .from('operadores')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      result.success = false
      result.errors.push(`Error al obtener operadores: ${error.message}`)
      return result
    }

    if (!data || data.length === 0) {
      return result
    }

    // Insertar/actualizar en SQLite local
    for (const operador of data) {
      try {
        await window.electron.db.run(
          `INSERT OR REPLACE INTO operadores (id, operador, clave_operador, created_at)
           VALUES (?, ?, ?, ?)`,
          [
            operador.id,
            operador.operador,
            operador.clave_operador,
            operador.created_at,
          ]
        )
        result.synced++
      } catch (err) {
        result.errors.push(`Error al guardar operador ${operador.id}: ${err}`)
      }
    }

    // Sincronizar operadores_empresas
    const { data: opEmpresas } = await supabase
      .from('operadores_empresas')
      .select('*')

    if (opEmpresas && opEmpresas.length > 0) {
      for (const oe of opEmpresas) {
        try {
          await window.electron.db.run(
            `INSERT OR REPLACE INTO operadores_empresas (operador_id, clave_empresa)
             VALUES (?, ?)`,
            [oe.operador_id, oe.clave_empresa]
          )
        } catch (err) {
          // Silenciar errores de duplicados
        }
      }
    }


  } catch (error) {
    result.success = false
    result.errors.push(`Error general: ${error}`)
  }

  return result
}

/**
 * Sincroniza rutas desde Supabase a SQLite local
 */
export async function syncRutas(): Promise<SyncResult> {
  const result: SyncResult = { success: true, synced: 0, errors: [] }

  try {
    if (!supabase) {
      return { success: false, synced: 0, errors: ['Supabase no configurado'] }
    }

    // Obtener rutas de Supabase
    const { data, error } = await supabase
      .from('rutas')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      result.success = false
      result.errors.push(`Error al obtener rutas: ${error.message}`)
      return result
    }

    if (!data || data.length === 0) {
      return result
    }

    // Insertar/actualizar en SQLite local
    for (const ruta of data) {
      try {
        await window.electron.db.run(
          `INSERT OR REPLACE INTO rutas (id, ruta, clave_ruta, clave_empresa)
           VALUES (?, ?, ?, ?)`,
          [ruta.id, ruta.ruta, ruta.clave_ruta, ruta.clave_empresa]
        )
        result.synced++
      } catch (err) {
        result.errors.push(`Error al guardar ruta ${ruta.id}: ${err}`)
      }
    }


  } catch (error) {
    result.success = false
    result.errors.push(`Error general: ${error}`)
  }

  return result
}

/**
 * Sincroniza conceptos desde Supabase a SQLite local
 */
export async function syncConceptos(): Promise<SyncResult> {
  const result: SyncResult = { success: true, synced: 0, errors: [] }

  try {
    if (!supabase) {
      return { success: false, synced: 0, errors: ['Supabase no configurado'] }
    }

    // Obtener conceptos de Supabase
    const { data, error } = await supabase
      .from('conceptos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      result.success = false
      result.errors.push(`Error al obtener conceptos: ${error.message}`)
      return result
    }

    if (!data || data.length === 0) {
      return result
    }

    // Insertar/actualizar en SQLite local
    for (const concepto of data) {
      try {
        await window.electron.db.run(
          `INSERT OR REPLACE INTO conceptos (id, nombre, clave_concepto, activo, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            concepto.id,
            concepto.nombre,
            concepto.clave_concepto,
            concepto.activo ? 1 : 0,
            concepto.created_at,
            concepto.updated_at,
          ]
        )
        result.synced++
      } catch (err) {
        result.errors.push(`Error al guardar concepto ${concepto.id}: ${err}`)
      }
    }

    // Sincronizar conceptos_empresas
    const { data: concEmpresas } = await supabase
      .from('conceptos_empresas')
      .select('*')

    if (concEmpresas && concEmpresas.length > 0) {
      for (const ce of concEmpresas) {
        try {
          await window.electron.db.run(
            `INSERT OR REPLACE INTO conceptos_empresas (concepto_id, clave_empresa)
             VALUES (?, ?)`,
            [ce.concepto_id, ce.clave_empresa]
          )
        } catch (err) {
          // Silenciar errores de duplicados
        }
      }
    }


  } catch (error) {
    result.success = false
    result.errors.push(`Error general: ${error}`)
  }

  return result
}

/**
 * Sincroniza empresas desde Supabase a SQLite local
 */
export async function syncEmpresas(): Promise<SyncResult> {
  const result: SyncResult = { success: true, synced: 0, errors: [] }

  try {
    if (!supabase) {
      return { success: false, synced: 0, errors: ['Supabase no configurado'] }
    }

    // Obtener empresas de Supabase
    const { data, error } = await supabase
      .from('empresa')
      .select('*')
      .order('clave_empresa', { ascending: true })

    if (error) {
      result.success = false
      result.errors.push(`Error al obtener empresas: ${error.message}`)
      return result
    }

    if (!data || data.length === 0) {
      return result
    }

    // Insertar/actualizar en SQLite local
    for (const empresa of data) {
      try {
        await window.electron.db.run(
          `INSERT OR REPLACE INTO empresa (id, empresa, clave_empresa, prefijo)
           VALUES (?, ?, ?, ?)`,
          [empresa.id, empresa.empresa, empresa.clave_empresa, empresa.prefijo]
        )
        result.synced++
      } catch (err) {
        result.errors.push(`Error al guardar empresa ${empresa.id}: ${err}`)
      }
    }


  } catch (error) {
    result.success = false
    result.errors.push(`Error general: ${error}`)
  }

  return result
}

/**
 * Sincroniza todas las entidades maestras
 */
export async function syncAllEntities(): Promise<{
  vehiculos: SyncResult
  operadores: SyncResult
  rutas: SyncResult
  conceptos: SyncResult
  empresas: SyncResult
}> {


  const results = {
    vehiculos: await syncVehiculos(),
    operadores: await syncOperadores(),
    rutas: await syncRutas(),
    conceptos: await syncConceptos(),
    empresas: await syncEmpresas(),
  }

  const totalSynced =
    results.vehiculos.synced +
    results.operadores.synced +
    results.rutas.synced +
    results.conceptos.synced +
    results.empresas.synced



  return results
}
