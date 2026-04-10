import type { Result } from '../../domain/shared/Result'
import { ResultFactory } from '../../domain/shared/Result'
import { FolioSequence } from '../../domain/entities/FolioSequence'
import type { FolioSequenceProps } from '../../domain/entities/FolioSequence'
import type { IFolioSequenceRepository } from '../../domain/repositories/IFolioSequenceRepository'
import { supabase } from '../../lib/supabase'

/**
 * Repositorio Supabase para FolioSequence
 * Lee/escribe la tabla folio_sequences en Supabase.
 * Esa tabla se mantiene actualizada automáticamente vía trigger AFTER INSERT en registros.
 * getMaxFolioNumberFromRegistros() es O(1) — 1 fila por índice, sin full-scan.
 */
export class SupabaseFolioSequenceRepository implements IFolioSequenceRepository {
  /**
   * Guarda o actualiza una secuencia en Supabase
   */
  async save(sequence: FolioSequence): Promise<Result<FolioSequence>> {
    try {
      const data = {
        id: sequence.id,
        clave_empresa: sequence.claveEmpresa,
        prefijo_empresa: sequence.prefijoEmpresa,
        ultimo_numero: sequence.ultimoNumero,
        sincronizado: sequence.sincronizado,
        updated_at: sequence.updatedAt.toISOString(),
      }

      const { error } = await supabase
        .from('folio_sequences')
        .upsert(data, { onConflict: 'clave_empresa' })

      if (error) {
        return ResultFactory.fail(new Error(`Error al guardar en Supabase: ${error.message}`))
      }

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
      const { data, error } = await supabase
        .from('folio_sequences')
        .select('*')
        .eq('clave_empresa', claveEmpresa)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return ResultFactory.ok(null)
        }
        return ResultFactory.fail(new Error(`Error al buscar secuencia: ${error.message}`))
      }

      return this.mapRowToSequence(data)
    } catch (error) {
      return ResultFactory.fromError(error)
    }
  }

  /**
   * Obtiene todas las secuencias (todas las empresas de un golpe — 14 filas max)
   */
  async findAll(): Promise<Result<FolioSequence[]>> {
    try {
      const { data, error } = await supabase
        .from('folio_sequences')
        .select('*')
        .order('clave_empresa')

      if (error) {
        return ResultFactory.fail(new Error(`Error al listar secuencias: ${error.message}`))
      }

      const sequences: FolioSequence[] = []
      for (const row of data || []) {
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
   * Obtiene el último número de folio usado para una empresa desde folio_sequences.
   * Lectura de 1 fila por índice — O(1), sin full-scan sobre registros.
   */
  async getMaxFolioNumberFromRegistros(claveEmpresa: number): Promise<Result<number>> {
    try {
      const { data, error } = await supabase
        .from('folio_sequences')
        .select('ultimo_numero')
        .eq('clave_empresa', claveEmpresa)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No existe aún la fila para esta empresa — contador en 0
          return ResultFactory.ok(0)
        }
        console.warn(`⚠️ Error al obtener folio_sequences de Supabase:`, error.message)
        return ResultFactory.fail(new Error(`Error al obtener max folio: ${error.message}`))
      }

      return ResultFactory.ok(data.ultimo_numero ?? 0)
    } catch (error) {
      console.error(`❌ Error al obtener max folio de Supabase:`, error)
      return ResultFactory.fromError(error)
    }
  }

  /**
   * Marca una secuencia como sincronizada
   */
  async markAsSynchronized(claveEmpresa: number): Promise<Result<void>> {
    try {
      const { error } = await supabase
        .from('folio_sequences')
        .update({
          sincronizado: true,
          updated_at: new Date().toISOString(),
        })
        .eq('clave_empresa', claveEmpresa)

      if (error) {
        return ResultFactory.fail(new Error(`Error al marcar como sincronizado: ${error.message}`))
      }

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
      const { data, error } = await supabase
        .from('folio_sequences')
        .select('*')
        .eq('sincronizado', false)

      if (error) {
        return ResultFactory.fail(new Error(`Error al buscar no sincronizados: ${error.message}`))
      }

      const sequences: FolioSequence[] = []
      for (const row of data || []) {
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
   * Not implemented for Supabase - folio generation is always local
   * Supabase is used only for reconciliation, not generation
   */
  async incrementAndGetNext(
    _claveEmpresa: number,
    _prefijoEmpresa: string
  ): Promise<Result<{ folio: string; sequence: FolioSequence }>> {
    return ResultFactory.fail(
      new Error('incrementAndGetNext not supported for Supabase repository - use local repository')
    )
  }

  /**
   * Mapea una fila de Supabase a entidad FolioSequence
   */
  private mapRowToSequence(row: any): Result<FolioSequence> {
    const props: FolioSequenceProps = {
      id: row.id,
      claveEmpresa: row.clave_empresa,
      prefijoEmpresa: row.prefijo_empresa,
      ultimoNumero: row.ultimo_numero,
      sincronizado: row.sincronizado,
      updatedAt: new Date(row.updated_at),
    }

    return FolioSequence.create(props)
  }
}
