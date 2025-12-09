import type { Result } from '../../domain/shared/Result'
import { ResultFactory } from '../../domain/shared/Result'
import { FolioSequence } from '../../domain/entities/FolioSequence'
import type { FolioSequenceProps } from '../../domain/entities/FolioSequence'
import type { IFolioSequenceRepository } from '../../domain/repositories/IFolioSequenceRepository'

/**
 * Repositorio SQLite para FolioSequence
 * Maneja contadores locales de folios por empresa
 */
export class SQLiteFolioSequenceRepository implements IFolioSequenceRepository {
  /**
   * Guarda o actualiza una secuencia
   */
  async save(sequence: FolioSequence): Promise<Result<FolioSequence>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'))
      }

      const query = `
        INSERT OR REPLACE INTO folio_sequences 
        (id, clave_empresa, prefijo_empresa, ultimo_numero, sincronizado, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `

      const params = [
        sequence.id,
        sequence.claveEmpresa,
        sequence.prefijoEmpresa,
        sequence.ultimoNumero,
        sequence.sincronizado ? 1 : 0,
        sequence.updatedAt.toISOString(),
      ]

      await window.electron.db.run(query, params)

      return ResultFactory.ok(sequence)
    } catch (error) {
      return ResultFactory.fromError(error)
    }
  }

  /**
   * Busca una secuencia por clave de empresa
   */
  async findByClaveEmpresa(claveEmpresa: number): Promise<Result<FolioSequence | null>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'))
      }

      const query = 'SELECT * FROM folio_sequences WHERE clave_empresa = ?'
      const row = await window.electron.db.get(query, [claveEmpresa])

      if (!row) {
        return ResultFactory.ok(null)
      }

      return this.mapRowToSequence(row)
    } catch (error) {
      return ResultFactory.fromError(error)
    }
  }

  /**
   * Obtiene todas las secuencias
   */
  async findAll(): Promise<Result<FolioSequence[]>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'))
      }

      const query = 'SELECT * FROM folio_sequences ORDER BY clave_empresa'
      const rows = await window.electron.db.all(query)

      const sequences: FolioSequence[] = []
      for (const row of rows) {
        const result = this.mapRowToSequence(row)
        if (result.success && result.value) {
          sequences.push(result.value)
        }
      }

      return ResultFactory.ok(sequences)
    } catch (error) {
      return ResultFactory.fromError(error)
    }
  }

  /**
   * Obtiene el máximo número de folio de registros en Supabase/SQLite para una empresa
   * Extrae el número del formato PREF-0000001
   */
  async getMaxFolioNumberFromRegistros(claveEmpresa: number): Promise<Result<number>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'))
      }

      const query = `
        SELECT folio 
        FROM registros 
        WHERE clave_empresa = ? 
        AND folio IS NOT NULL 
        AND folio GLOB '[A-Z][A-Z][A-Z][A-Z]-[0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
        ORDER BY folio DESC
        LIMIT 1
      `

      const row = await window.electron.db.get(query, [claveEmpresa])

      if (!row || !row.folio) {
        return ResultFactory.ok(0)
      }

      // Extraer número del formato PREF-0000001
      const parts = row.folio.split('-')
      if (parts.length !== 2) {
        return ResultFactory.ok(0)
      }

      const numero = parseInt(parts[1], 10)
      if (isNaN(numero)) {
        return ResultFactory.ok(0)
      }

      return ResultFactory.ok(numero)
    } catch (error) {
      return ResultFactory.fromError(error)
    }
  }

  /**
   * Marca una secuencia como sincronizada
   */
  async markAsSynchronized(claveEmpresa: number): Promise<Result<void>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'))
      }

      const query = `
        UPDATE folio_sequences 
        SET sincronizado = 1, updated_at = ? 
        WHERE clave_empresa = ?
      `

      await window.electron.db.run(query, [new Date().toISOString(), claveEmpresa])

      return ResultFactory.ok(undefined)
    } catch (error) {
      return ResultFactory.fromError(error)
    }
  }

  /**
   * Obtiene secuencias no sincronizadas
   */
  async findUnsynchronized(): Promise<Result<FolioSequence[]>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'))
      }

      const query = 'SELECT * FROM folio_sequences WHERE sincronizado = 0'
      const rows = await window.electron.db.all(query)

      const sequences: FolioSequence[] = []
      for (const row of rows) {
        const result = this.mapRowToSequence(row)
        if (result.success && result.value) {
          sequences.push(result.value)
        }
      }

      return ResultFactory.ok(sequences)
    } catch (error) {
      return ResultFactory.fromError(error)
    }
  }

  /**
   * Atomically increments the sequence and returns the next folio
   * Delegates to Electron main process for atomic database operation
   */
  async incrementAndGetNext(
    claveEmpresa: number,
    prefijoEmpresa: string
  ): Promise<Result<{ folio: string; sequence: FolioSequence }>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'))
      }

      // Call atomic increment via IPC (includes mutex + transaction)
      const result = await window.electron.db.atomicIncrementFolio(
        claveEmpresa,
        prefijoEmpresa
      )

      // Create sequence entity from result
      const sequenceResult = FolioSequence.create({
        claveEmpresa,
        prefijoEmpresa,
        ultimoNumero: result.ultimoNumero,
        sincronizado: false, // Offline operation, not synced yet
        updatedAt: new Date(),
      })

      if (!sequenceResult.success) {
        return ResultFactory.fail(sequenceResult.error)
      }

      return ResultFactory.ok({
        folio: result.folio,
        sequence: sequenceResult.value,
      })
    } catch (error) {
      return ResultFactory.fromError(error)
    }
  }

  /**
   * Mapea una fila de base de datos a entidad FolioSequence
   */
  private mapRowToSequence(row: any): Result<FolioSequence> {
    const props: FolioSequenceProps = {
      id: row.id,
      claveEmpresa: row.clave_empresa,
      prefijoEmpresa: row.prefijo_empresa,
      ultimoNumero: row.ultimo_numero,
      sincronizado: row.sincronizado === 1,
      updatedAt: new Date(row.updated_at),
    }

    return FolioSequence.create(props)
  }
}
