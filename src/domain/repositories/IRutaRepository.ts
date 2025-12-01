import type { Result } from '../shared/Result';
import { Ruta } from '../entities/Ruta';

/**
 * Interfaz del repositorio de rutas
 */
export interface IRutaRepository {
  /**
   * Guarda una ruta
   */
  save(ruta: Ruta): Promise<Result<Ruta>>;

  /**
   * Busca una ruta por ID
   */
  findById(id: number): Promise<Result<Ruta | null>>;

  /**
   * Busca una ruta por clave
   */
  findByClave(claveRuta: number): Promise<Result<Ruta | null>>;

  /**
   * Busca rutas por empresa
   */
  findByEmpresa(claveEmpresa: number): Promise<Result<Ruta[]>>;

  /**
   * Obtiene todas las rutas
   */
  findAll(): Promise<Result<Ruta[]>>;

  /**
   * Actualiza una ruta
   */
  update(ruta: Ruta): Promise<Result<Ruta>>;

  /**
   * Elimina una ruta
   */
  delete(id: number): Promise<Result<void>>;
}
