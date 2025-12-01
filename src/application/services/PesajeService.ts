import type { Result } from '../../domain/shared/Result';
import { ResultFactory } from '../../domain/shared/Result';
import type { Registro } from '../../domain/entities/Registro';
import { CreateEntradaUseCase } from '../../domain/use-cases/registro/CreateEntrada';
import type { CreateEntradaInput } from '../../domain/use-cases/registro/CreateEntrada';
import { CompleteWithSalidaUseCase } from '../../domain/use-cases/registro/CompleteWithSalida';
import type { CompleteWithSalidaInput } from '../../domain/use-cases/registro/CompleteWithSalida';
import { FindPendingRegistrosUseCase } from '../../domain/use-cases/registro/FindPendingRegistros';
import type { IWeightReader } from '../../domain/hardware/IWeightReader';

/**
 * Servicio de aplicación para gestión de pesajes
 * Orquesta los casos de uso y el hardware
 */
export class PesajeService {
  private readonly createEntradaUseCase: CreateEntradaUseCase;
  private readonly completeWithSalidaUseCase: CompleteWithSalidaUseCase;
  private readonly findPendingUseCase: FindPendingRegistrosUseCase;
  private readonly weightReader: IWeightReader;

  constructor(
    createEntradaUseCase: CreateEntradaUseCase,
    completeWithSalidaUseCase: CompleteWithSalidaUseCase,
    findPendingUseCase: FindPendingRegistrosUseCase,
    weightReader: IWeightReader
  ) {
    this.createEntradaUseCase = createEntradaUseCase;
    this.completeWithSalidaUseCase = completeWithSalidaUseCase;
    this.findPendingUseCase = findPendingUseCase;
    this.weightReader = weightReader;
  }

  /**
   * Registra una entrada con el peso actual de la báscula
   */
  async registrarEntrada(input: Omit<CreateEntradaInput, 'pesoEntrada'>): Promise<Result<Registro>> {
    try {
      // Obtener el peso actual de la báscula
      const pesoActual = this.weightReader.getCurrentWeight();

      if (!pesoActual || pesoActual <= 0) {
        return ResultFactory.fail(
          new Error('No hay peso válido en la báscula. Asegúrese de que el vehículo esté sobre la báscula.')
        );
      }

      // Verificar si hay registros pendientes para esta placa
      const pendingResult = await this.findPendingUseCase.execute({
        placaVehiculo: input.placaVehiculo,
      });

      if (pendingResult.success && pendingResult.value.count > 0) {
        return ResultFactory.fail(
          new Error(
            `Ya existe un registro de entrada pendiente para la placa ${input.placaVehiculo}. Complete primero la salida.`
          )
        );
      }

      // Crear el registro de entrada
      const result = await this.createEntradaUseCase.execute({
        ...input,
        pesoEntrada: pesoActual,
      });

      return result;
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  /**
   * Registra una salida con el peso actual de la báscula
   */
  async registrarSalida(
    placaVehiculo: string,
    observaciones?: string
  ): Promise<Result<Registro>> {
    try {
      // Obtener el peso actual de la báscula
      const pesoActual = this.weightReader.getCurrentWeight();

      if (!pesoActual || pesoActual <= 0) {
        return ResultFactory.fail(
          new Error('No hay peso válido en la báscula. Asegúrese de que el vehículo esté sobre la báscula.')
        );
      }

      // Buscar registro pendiente para esta placa
      const pendingResult = await this.findPendingUseCase.execute({
        placaVehiculo,
      });

      if (!pendingResult.success) {
        return pendingResult as any;
      }

      if (pendingResult.value.count === 0) {
        return ResultFactory.fail(
          new Error(
            `No hay registro de entrada pendiente para la placa ${placaVehiculo}. Registre primero la entrada.`
          )
        );
      }

      // Tomar el primer registro pendiente (el más reciente)
      const registroPendiente = pendingResult.value.registros[0];

      // Completar con salida
      const completeInput: CompleteWithSalidaInput = {
        registroId: registroPendiente.id!,
        pesoSalida: pesoActual,
        observaciones,
      };

      console.log('🔧 PesajeService - Llamando a completeWithSalidaUseCase con:', completeInput);

      const result = await this.completeWithSalidaUseCase.execute(completeInput);

      if (result.success) {
        console.log('✅ PesajeService - Registro actualizado:', {
          id: result.value.id,
          pesoEntrada: result.value.pesoEntrada,
          pesoSalida: result.value.pesoSalida,
          pesoNeto: result.value.getPesoNeto()
        });
      } else {
        console.error('❌ PesajeService - Error al actualizar:', result.error);
      }

      return result;
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  /**
   * Busca registros pendientes por placa
   */
  async buscarPendientes(placaVehiculo: string): Promise<Result<Registro[]>> {
    try {
      const result = await this.findPendingUseCase.execute({ placaVehiculo });

      if (!result.success) {
        return result as any;
      }

      return ResultFactory.ok(result.value.registros);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  /**
   * Obtiene el peso actual de la báscula
   */
  getPesoActual(): number | null {
    return this.weightReader.getCurrentWeight();
  }

  /**
   * Verifica si la báscula está conectada
   */
  isBasculaConectada(): boolean {
    return this.weightReader.isConnected();
  }

  /**
   * Registra un callback para actualizaciones de peso
   */
  onPesoActualizado(callback: (peso: number) => void): void {
    this.weightReader.onWeightUpdate(callback);
  }
}
