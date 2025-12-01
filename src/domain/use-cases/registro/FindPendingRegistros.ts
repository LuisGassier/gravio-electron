import type { Result } from '../../shared/Result';
import { ResultFactory } from '../../shared/Result';
import type { Registro } from '../../entities/Registro';
import type { IRegistroRepository } from '../../repositories/IRegistroRepository';

export interface FindPendingRegistrosInput {
  placaVehiculo: string;
}

export interface FindPendingRegistrosOutput {
  registros: Registro[];
  count: number;
}

/**
 * Use Case: Buscar registros pendientes de completar por placa
 *
 * Útil para mostrar al operador si hay un camión con entrada
 * pero sin salida registrada
 */
export class FindPendingRegistrosUseCase {
  private readonly registroRepository: IRegistroRepository;

  constructor(registroRepository: IRegistroRepository) {
    this.registroRepository = registroRepository;
  }

  async execute(
    input: FindPendingRegistrosInput
  ): Promise<Result<FindPendingRegistrosOutput>> {
    try {
      const findResult = await this.registroRepository.findPendingByPlaca(
        input.placaVehiculo
      );

      if (!findResult.success) {
        return findResult;
      }

      const registros = findResult.value;

      return ResultFactory.ok({
        registros,
        count: registros.length,
      });
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }
}
