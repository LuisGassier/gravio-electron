import type { Result } from '../shared/Result';
import { Operador } from '../entities/Operador';

/**
 * Interfaz del repositorio de operadores
 */
export interface IOperadorRepository {
  /**
   * Guarda un operador
   */
  save(operador: Operador): Promise<Result<Operador>>;

  /**
   * Busca un operador por ID
   */
  findById(id: string): Promise<Result<Operador | null>>;

  /**
   * Busca un operador por clave
   */
  findByClave(claveOperador: number): Promise<Result<Operador | null>>;

  /**
   * Busca operadores por empresa
   */
  findByEmpresa(claveEmpresa: number): Promise<Result<Operador[]>>;

  /**
   * Obtiene todos los operadores
   */
  findAll(): Promise<Result<Operador[]>>;

  /**
   * Actualiza un operador
   */
  update(operador: Operador): Promise<Result<Operador>>;

  /**
   * Elimina un operador
   */
  delete(id: string): Promise<Result<void>>;
}
