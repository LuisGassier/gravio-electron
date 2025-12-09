import type { Result } from '../shared/Result'
import type { FolioSequence } from '../entities/FolioSequence'

/**
 * Interfaz del repositorio de secuencias de folios
 * Define operaciones para gestionar contadores de folios por empresa
 */
export interface IFolioSequenceRepository {
  /**
   * Guarda o actualiza una secuencia de folios
   */
  save(sequence: FolioSequence): Promise<Result<FolioSequence>>

  /**
   * Busca una secuencia por clave de empresa
   */
  findByClaveEmpresa(claveEmpresa: number): Promise<Result<FolioSequence | null>>

  /**
   * Obtiene todas las secuencias
   */
  findAll(): Promise<Result<FolioSequence[]>>

  /**
   * Obtiene el máximo número de folio usado en registros para una empresa
   * Se usa para sincronizar con Supabase y detectar el último folio generado
   */
  getMaxFolioNumberFromRegistros(claveEmpresa: number): Promise<Result<number>>

  /**
   * Marca una secuencia como sincronizada
   */
  markAsSynchronized(claveEmpresa: number): Promise<Result<void>>

  /**
   * Obtiene todas las secuencias no sincronizadas
   */
  findUnsynchronized(): Promise<Result<FolioSequence[]>>

  /**
   * Atomically increments the sequence and returns the next folio
   * Uses database transaction to prevent race conditions
   *
   * @param claveEmpresa - Company key
   * @param prefijoEmpresa - Company prefix (e.g., "PALA")
   * @returns Next folio and updated sequence
   */
  incrementAndGetNext(
    claveEmpresa: number,
    prefijoEmpresa: string
  ): Promise<Result<{
    folio: string
    sequence: FolioSequence
  }>>
}
