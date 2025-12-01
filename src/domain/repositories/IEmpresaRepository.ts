import type { Result } from '../shared/Result';
import { Empresa } from '../entities/Empresa';

/**
 * Interfaz del repositorio de empresas
 */
export interface IEmpresaRepository {
  /**
   * Guarda una empresa
   */
  save(empresa: Empresa): Promise<Result<Empresa>>;

  /**
   * Busca una empresa por ID
   */
  findById(id: string): Promise<Result<Empresa | null>>;

  /**
   * Busca una empresa por clave
   */
  findByClave(claveEmpresa: number): Promise<Result<Empresa | null>>;

  /**
   * Busca una empresa por prefijo
   */
  findByPrefijo(prefijo: string): Promise<Result<Empresa | null>>;

  /**
   * Obtiene todas las empresas
   */
  findAll(): Promise<Result<Empresa[]>>;

  /**
   * Actualiza una empresa
   */
  update(empresa: Empresa): Promise<Result<Empresa>>;

  /**
   * Elimina una empresa
   */
  delete(id: string): Promise<Result<void>>;
}
