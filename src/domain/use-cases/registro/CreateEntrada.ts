import type { Result } from '../../shared/Result';
import { ResultFactory } from '../../shared/Result';
import { Registro } from '../../entities/Registro';
import type { RegistroProps } from '../../entities/Registro';
import type { IRegistroRepository } from '../../repositories/IRegistroRepository';

export interface CreateEntradaInput {
  claveRuta: number;
  ruta: string;
  placaVehiculo: string;
  numeroEconomico: string;
  claveOperador: number;
  operador: string;
  claveEmpresa: number;
  claveConcepto: number;
  conceptoId?: string;
  pesoEntrada: number;
  observaciones?: string;
}

/**
 * Use Case: Crear un registro de entrada (pesaje de entrada)
 *
 * Responsabilidades:
 * 1. Validar los datos de entrada
 * 2. Crear la entidad Registro con tipo 'entrada'
 * 3. Persistir en el repositorio local (SQLite)
 * 4. El folio se generará en Supabase al sincronizar
 */
export class CreateEntradaUseCase {
  private readonly registroRepository: IRegistroRepository;

  constructor(registroRepository: IRegistroRepository) {
    this.registroRepository = registroRepository;
  }

  async execute(input: CreateEntradaInput): Promise<Result<Registro>> {
    try {
      // Crear la entidad de dominio con validaciones
      const registroProps: RegistroProps = {
        claveRuta: input.claveRuta,
        ruta: input.ruta,
        placaVehiculo: input.placaVehiculo,
        numeroEconomico: input.numeroEconomico,
        claveOperador: input.claveOperador,
        operador: input.operador,
        claveEmpresa: input.claveEmpresa,
        claveConcepto: input.claveConcepto,
        conceptoId: input.conceptoId,
        pesoEntrada: input.pesoEntrada,
        fechaEntrada: new Date(),
        tipoPesaje: 'entrada',
        observaciones: input.observaciones || 'Pesaje de entrada automático',
        sincronizado: false,
      };

      const registroResult = Registro.create(registroProps);

      if (!registroResult.success) {
        return registroResult;
      }

      // Persistir en el repositorio
      const saveResult = await this.registroRepository.saveEntrada(
        registroResult.value
      );

      if (!saveResult.success) {
        return saveResult;
      }

      return ResultFactory.ok(saveResult.value);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }
}
