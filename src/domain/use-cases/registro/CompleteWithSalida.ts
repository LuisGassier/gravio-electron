import type { Result } from '../../shared/Result';
import { ResultFactory } from '../../shared/Result';
import type { Registro } from '../../entities/Registro';
import type { IRegistroRepository } from '../../repositories/IRegistroRepository';

export interface CompleteWithSalidaInput {
  registroId: string;
  pesoSalida: number;
  observaciones?: string;
}

/**
 * Use Case: Completar un registro con el pesaje de salida
 *
 * Responsabilidades:
 * 1. Buscar el registro de entrada por ID
 * 2. Validar que exista y tenga peso de entrada
 * 3. Actualizar con peso de salida y cambiar tipo a 'completo'
 * 4. Marcar como no sincronizado para enviar a Supabase
 */
export class CompleteWithSalidaUseCase {
  private readonly registroRepository: IRegistroRepository;

  constructor(registroRepository: IRegistroRepository) {
    this.registroRepository = registroRepository;
  }

  async execute(input: CompleteWithSalidaInput): Promise<Result<Registro>> {
    try {
      // Buscar el registro existente
      const findResult = await this.registroRepository.findById(input.registroId);

      if (!findResult.success) {
        return findResult;
      }

      if (!findResult.value) {
        return ResultFactory.fail(
          new Error(`Registro no encontrado: ${input.registroId}`)
        );
      }

      const registro = findResult.value;

      // Validar que tenga peso de entrada
      if (!registro.pesoEntrada) {
        return ResultFactory.fail(
          new Error('El registro no tiene peso de entrada registrado')
        );
      }

      // Validar que no esté ya completo
      if (registro.isCompleto()) {
        return ResultFactory.fail(
          new Error('El registro ya está completo con peso de salida')
        );
      }

      // Actualizar con peso de salida usando el repositorio
      const updateResult = await this.registroRepository.updateWithSalida(
        input.registroId,
        input.pesoSalida,
        new Date(),
        input.observaciones
      );

      if (!updateResult.success) {
        return updateResult;
      }

      return ResultFactory.ok(updateResult.value);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }
}
