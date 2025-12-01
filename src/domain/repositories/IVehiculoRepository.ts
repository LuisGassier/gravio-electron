import type { Result } from '../shared/Result';
import { Vehiculo } from '../entities/Vehiculo';

/**
 * Interfaz del repositorio de vehículos
 */
export interface IVehiculoRepository {
  /**
   * Guarda un vehículo
   */
  save(vehiculo: Vehiculo): Promise<Result<Vehiculo>>;

  /**
   * Busca un vehículo por ID
   */
  findById(id: string): Promise<Result<Vehiculo | null>>;

  /**
   * Busca un vehículo por placas (singular)
   */
  findByPlaca(placa: string): Promise<Result<Vehiculo | null>>;

  /**
   * Busca vehículos por múltiples placas
   */
  findByPlacas(placas: string[]): Promise<Result<Vehiculo[]>>;

  /**
   * Busca un vehículo por número económico
   */
  findByNoEconomico(noEconomico: string): Promise<Result<Vehiculo | null>>;

  /**
   * Busca vehículos por empresa
   */
  findByEmpresa(claveEmpresa: number): Promise<Result<Vehiculo[]>>;

  /**
   * Obtiene todos los vehículos
   */
  findAll(): Promise<Result<Vehiculo[]>>;

  /**
   * Actualiza un vehículo
   */
  update(vehiculo: Vehiculo): Promise<Result<Vehiculo>>;

  /**
   * Elimina un vehículo
   */
  delete(id: string): Promise<Result<void>>;
}
