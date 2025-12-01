import type { Result } from '../../domain/shared/Result'
import { ResultFactory } from '../../domain/shared/Result'
import { FolioSequence } from '../../domain/entities/FolioSequence'
import type { FolioSequenceProps } from '../../domain/entities/FolioSequence'
import type { IFolioSequenceRepository } from '../../domain/repositories/IFolioSequenceRepository'
import { supabase } from '../../lib/supabase'

/**
 * Repositorio Supabase para FolioSequence
 * Usado cuando hay conectividad para obtener el último folio desde el servidor
 * 
 * NOTA: Esta tabla AÚN NO EXISTE en Supabase - se usará cuando se ejecute la migración
 * Por ahora, getMaxFolioNumberFromRegistros consulta directamente la tabla registros
 */
export class SupabaseFolioSequenceRepository implements IFolioSequenceRepository {
  /**
   * Guarda o actualiza una secuencia en Supabase
   * NOTA: Tabla folio_sequences aún no existe - pendiente migración
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
   * NOTA: Tabla folio_sequences aún no existe - pendiente migración
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
   * Obtiene todas las secuencias
   * NOTA: Tabla folio_sequences aún no existe - pendiente migración
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
   * Obtiene el máximo número de folio de registros en Supabase para una empresa
   * Extrae el número del formato PREF-0000001
   * 
   * ESTE MÉTODO SÍ FUNCIONA - consulta la tabla registros que ya existe
   */
  async getMaxFolioNumberFromRegistros(claveEmpresa: number): Promise<Result<number>> {
    try {
      // Usar la función de Supabase que ya existe: get_next_folio_number
      // Esta función hace exactamente lo que necesitamos
      const { data, error } = await supabase.rpc('get_next_folio_number', {
        p_clave_empresa: claveEmpresa,
      })

      if (error) {
        console.warn(`⚠️ Error al obtener max folio de Supabase:`, error.message)
        return ResultFactory.fail(new Error(`Error al obtener max folio: ${error.message}`))
      }

      // get_next_folio_number retorna el SIGUIENTE número (max + 1)
      // Necesitamos el ÚLTIMO usado, así que restamos 1
      const ultimoNumero = Math.max(0, (data || 1) - 1)

      console.log(`📊 Max folio en Supabase para empresa ${claveEmpresa}: ${ultimoNumero}`)

      return ResultFactory.ok(ultimoNumero)
    } catch (error) {
      console.error(`❌ Error al obtener max folio de Supabase:`, error)
      return ResultFactory.fromError(error)
    }
  }

  /**
   * Marca una secuencia como sincronizada
   * NOTA: Tabla folio_sequences aún no existe - pendiente migración
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
   * NOTA: Tabla folio_sequences aún no existe - pendiente migración
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
