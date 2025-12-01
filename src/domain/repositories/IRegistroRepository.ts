import type { Result } from '../shared/Result';
import { Registro } from '../entities/Registro';

/**
 * Interfaz del repositorio de registros
 * Abstrae la persistencia de datos
 */
export interface IRegistroRepository {
  /**
   * Guarda un nuevo registro de entrada
   */
  saveEntrada(registro: Registro): Promise<Result<Registro>>;

  /**
   * Actualiza un registro con información de salida
   */
  updateWithSalida(
    id: string,
    pesoSalida: number,
    fechaSalida: Date,
    observaciones?: string
  ): Promise<Result<Registro>>;

  /**
   * Busca un registro por ID
   */
  findById(id: string): Promise<Result<Registro | null>>;

  /**
   * Busca un registro por folio
   */
  findByFolio(folio: string): Promise<Result<Registro | null>>;

  /**
   * Busca registros pendientes de completar (solo con entrada)
   */
  findPendingByPlaca(placa: string): Promise<Result<Registro[]>>;

  /**
   * Obtiene todos los registros pendientes (sin salida)
   */
  findAllPending(): Promise<Result<Registro[]>>;

  /**
   * Obtiene todos los registros no sincronizados
   */
  findUnsynchronized(): Promise<Result<Registro[]>>;

  /**
   * Marca un registro como sincronizado
   */
  markAsSynced(id: string): Promise<Result<void>>;

  /**
   * Obtiene registros por rango de fechas
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<Result<Registro[]>>;

  /**
   * Obtiene registros por empresa
   */
  findByEmpresa(claveEmpresa: number, limit?: number): Promise<Result<Registro[]>>;

  /**
   * Elimina un registro (soft delete o físico según implementación)
   */
  delete(id: string): Promise<Result<void>>;
}
