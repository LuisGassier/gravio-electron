import type { Result } from '../../domain/shared/Result';
import { ResultFactory } from '../../domain/shared/Result';
import type { Registro } from '../../domain/entities/Registro';
import { CreateEntradaUseCase } from '../../domain/use-cases/registro/CreateEntrada';
import type { CreateEntradaInput } from '../../domain/use-cases/registro/CreateEntrada';
import { CompleteWithSalidaUseCase } from '../../domain/use-cases/registro/CompleteWithSalida';
import type { CompleteWithSalidaInput } from '../../domain/use-cases/registro/CompleteWithSalida';
import { FindPendingRegistrosUseCase } from '../../domain/use-cases/registro/FindPendingRegistros';
import { SyncRegistrosUseCase } from '../../domain/use-cases/sync/SyncRegistros';
import type { IWeightReader } from '../../domain/hardware/IWeightReader';
import type { FolioService } from './FolioService';
import { getCurrentUser } from '../../lib/supabase';

/**
 * Servicio de aplicación para gestión de pesajes
 * Orquesta los casos de uso y el hardware
 */
export class PesajeService {
  private readonly createEntradaUseCase: CreateEntradaUseCase;
  private readonly completeWithSalidaUseCase: CompleteWithSalidaUseCase;
  private readonly findPendingUseCase: FindPendingRegistrosUseCase;
  private readonly syncRegistrosUseCase: SyncRegistrosUseCase;
  private readonly weightReader: IWeightReader;
  private readonly folioService: FolioService;

  constructor(
    createEntradaUseCase: CreateEntradaUseCase,
    completeWithSalidaUseCase: CompleteWithSalidaUseCase,
    findPendingUseCase: FindPendingRegistrosUseCase,
    syncRegistrosUseCase: SyncRegistrosUseCase,
    weightReader: IWeightReader,
    folioService: FolioService
  ) {
    this.createEntradaUseCase = createEntradaUseCase;
    this.completeWithSalidaUseCase = completeWithSalidaUseCase;
    this.findPendingUseCase = findPendingUseCase;
    this.syncRegistrosUseCase = syncRegistrosUseCase;
    this.weightReader = weightReader;
    this.folioService = folioService;
  }

  /**
   * Registra una entrada con el peso actual de la báscula
   */
  async registrarEntrada(input: Omit<CreateEntradaInput, 'pesoEntrada' | 'registradoPor'>): Promise<Result<Registro>> {
    try {
      // Obtener el peso actual de la báscula
      const pesoActual = this.weightReader.getCurrentWeight();

      if (!pesoActual || pesoActual <= 0) {
        return ResultFactory.fail(
          new Error('No hay peso válido en la báscula. Asegúrese de que el vehículo esté sobre la báscula.')
        );
      }

      // 🛡️ VALIDACIÓN CRÍTICA: Verificar si hay registros pendientes para esta placa
      console.log(`🔍 Verificando registros pendientes para placa: ${input.placaVehiculo}`)
      const pendingResult = await this.findPendingUseCase.execute({
        placaVehiculo: input.placaVehiculo,
      });

      if (pendingResult.success && pendingResult.value.count > 0) {
        const pendingIds = pendingResult.value.registros.map(r => r.id).join(', ')
        console.error(`❌ DUPLICADO DETECTADO: Ya existe ${pendingResult.value.count} registro(s) pendiente(s) para placa ${input.placaVehiculo}`)
        console.error(`   IDs pendientes: ${pendingIds}`)
        return ResultFactory.fail(
          new Error(
            `Ya existe un registro de entrada pendiente para la placa ${input.placaVehiculo}. Complete primero la salida.`
          )
        );
      }

      console.log(`✅ No hay registros pendientes para placa ${input.placaVehiculo}, se puede crear entrada`)

      // 🎯 Generar folio offline — el registro siempre se crea aunque falle el folio
      let folioGenerado: string;
      const folioResult = await this.folioService.getNextFolio(input.claveEmpresa);
      if (folioResult.success) {
        folioGenerado = folioResult.value;
        console.log(`📋 Folio generado: ${folioGenerado} para empresa ${input.claveEmpresa}`);
      } else {
        // Folio temporal — el registro NO se pierde. Al sincronizar con Supabase,
        // el trigger generar_folio() asignará el folio definitivo (llega con folio=null).
        // SyncRegistros.executeSingle() actualizará el folio local con el de Supabase.
        folioGenerado = `TEMP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
        console.warn(`⚠️ No se pudo generar folio normal, usando temporal: ${folioGenerado}`, folioResult.error?.message);
      }

      // 👤 Obtener usuario actual
      let registradoPor: string | undefined;
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          registradoPor = currentUser.email || currentUser.nombre;
          console.log(`👤 Registro será guardado por: ${registradoPor}`);
        }
      } catch (error) {
        console.warn(`⚠️ No se pudo obtener usuario actual:`, error);
        // Continuar sin registradoPor
      }

      // Crear el registro de entrada con el folio generado (o undefined si hubo error)
      console.log(`📝 Creando entrada para placa ${input.placaVehiculo}, peso: ${pesoActual}kg, folio: ${folioGenerado || 'pendiente'}`)
      const result = await this.createEntradaUseCase.execute({
        ...input,
        pesoEntrada: pesoActual,
        folio: folioGenerado,
        registradoPor,
      });

      if (!result.success) {
        console.error(`❌ Error al crear entrada: ${result.error.message}`)
        return result;
      }

      // 🚀 Sincronizar en background — no bloquear al usuario
      const registroCreado = result.value;
      console.log(`✅ Entrada creada exitosamente: ID=${registroCreado.id}, Folio=${registroCreado.folio}, Placa=${registroCreado.placaVehiculo}`)
      if (registroCreado.id) {
        const idParaSync = registroCreado.id;
        this.syncRegistrosUseCase.executeSingle(idParaSync)
          .then(syncResult => {
            if (syncResult.success) {
              console.log(`✅ Entrada sincronizada en background - Folio: ${syncResult.value.folio || folioGenerado}`);
            } else {
              console.warn(`⚠️ Sync background entrada falló (se reintentará):`, syncResult.error?.message);
            }
          })
          .catch(error => {
            console.warn(`⚠️ Error en sync background entrada (se reintentará):`, error);
          });
      }

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

        // 🚀 Sincronizar en background — no bloquear al usuario
        if (result.value.id) {
          const idParaSync = result.value.id;
          this.syncRegistrosUseCase.executeSingle(idParaSync)
            .then(syncResult => {
              if (syncResult.success) {
                console.log(`✅ Salida sincronizada en background`);
              } else {
                console.warn(`⚠️ Sync background salida falló (se reintentará):`, syncResult.error?.message);
              }
            })
            .catch(error => {
              console.warn(`⚠️ Error en sync background salida (se reintentará):`, error);
            });
        }
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
