/**
 * Barrel file para exportaciones centralizadas del dominio
 */

// Shared
export * from './shared/Result';
export * from './shared/ValueObject';

// Entities
export * from './entities/Registro';
export * from './entities/Vehiculo';
export * from './entities/Operador';
export * from './entities/Ruta';
export * from './entities/Empresa';

// Repositories
export * from './repositories/IRegistroRepository';
export * from './repositories/IVehiculoRepository';
export * from './repositories/IOperadorRepository';
export * from './repositories/IRutaRepository';
export * from './repositories/IEmpresaRepository';

// Use Cases
export * from './use-cases/registro/CreateEntrada';
export * from './use-cases/registro/CompleteWithSalida';
export * from './use-cases/registro/FindPendingRegistros';
export * from './use-cases/sync/SyncRegistros';

// Hardware
export * from './hardware/IWeightReader';
