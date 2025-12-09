import type { Result } from '../../shared/Result';
import { ResultFactory } from '../../shared/Result';
import type { IRegistroRepository } from '../../repositories/IRegistroRepository';

export interface SyncRegistrosOutput {
  synced: number;
  failed: number;
  errors: Array<{ registroId: string; error: string }>;
}

/**
 * Use Case: Sincronizar registros locales con Supabase
 *
 * Responsabilidades:
 * 1. Obtener todos los registros no sincronizados de SQLite
 * 2. Enviarlos a Supabase (el folio se genera allá si no existe)
 * 3. Marcar como sincronizados los exitosos
 * 4. Reportar errores sin bloquear otros registros
 */
export class SyncRegistrosUseCase {
  private readonly localRepository: IRegistroRepository;
  private readonly remoteRepository: IRegistroRepository;

  constructor(
    localRepository: IRegistroRepository,
    remoteRepository: IRegistroRepository
  ) {
    this.localRepository = localRepository;
    this.remoteRepository = remoteRepository;
  }

  /**
   * Sincroniza un ÚNICO registro específico (optimizado para flujo de pesaje)
   * @param registroId ID del registro a sincronizar
   */
  async executeSingle(registroId: string): Promise<Result<{ folio?: string }>> {
    try {
      // 1. Obtener el registro local
      const registroResult = await this.localRepository.findById(registroId);

      if (!registroResult.success || !registroResult.value) {
        return ResultFactory.fail(new Error(`Registro ${registroId} no encontrado localmente`));
      }

      const registro = registroResult.value;

      // 2. Intentar insertar/actualizar en Supabase
      let remoteResult: Result<any>;
      
      if (registro.isCompleto()) {
        // 🔄 Tiene salida - intentar UPDATE primero
        console.log(`🔄 Intentando actualizar salida en Supabase para registro ${registroId}`);
        remoteResult = await this.remoteRepository.updateWithSalida(
          registroId,
          registro.pesoSalida!,
          registro.fechaSalida!,
          registro.observaciones
        );
        
        // Si el UPDATE falla porque no existe, intentar INSERT
        if (!remoteResult.success && remoteResult.error?.message.includes('no rows')) {
          console.log(`📥 Registro no existe, creando entrada completa en Supabase`);
          remoteResult = await this.remoteRepository.saveEntrada(registro);
        }
      } else {
        // 📥 Solo entrada - intentar INSERT
        console.log(`📥 Creando entrada en Supabase para registro ${registroId}`);
        remoteResult = await this.remoteRepository.saveEntrada(registro);
      }

      if (!remoteResult.success) {
        return ResultFactory.fail(remoteResult.error);
      }

      // 3. Actualizar folio localmente si se generó
      const registroRemoto = remoteResult.value;
      if (registroRemoto.folio && registroRemoto.folio !== registro.folio) {
        console.log(`📝 Actualizando folio local: ${registroRemoto.folio} para registro ${registroId}`);
        await this.localRepository.saveEntrada(registroRemoto);
      }

      // 4. Marcar como sincronizado
      await this.localRepository.markAsSynced(registroId);

      return ResultFactory.ok({ folio: registroRemoto.folio });
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async execute(): Promise<Result<SyncRegistrosOutput>> {
    try {
      let synced = 0;
      let failed = 0;
      const errors: Array<{ registroId: string; error: string }> = [];

      // ⚡ OPTIMIZACIÓN: Solo subir registros no sincronizados
      // La descarga de registros pendientes se hace vía Realtime
      // Esto reduce dramáticamente el uso de ancho de banda

      console.log('🔄 Sincronizando registros no sincronizados...');

      // Subir registros no sincronizados de SQLite → Supabase
      const unsyncedResult = await this.localRepository.findUnsynchronized();

      if (!unsyncedResult.success) {
        return unsyncedResult as any;
      }

      const unsyncedRegistros = unsyncedResult.value;

      if (unsyncedRegistros.length > 0) {
        // Sincronizar cada registro
        for (const registro of unsyncedRegistros) {
          try {
            // Intentar guardar en Supabase
            // Si es entrada, Supabase generará el folio
            const remoteResult = await this.remoteRepository.saveEntrada(registro);

            if (remoteResult.success) {
              // Actualizar el registro local con el folio generado por Supabase
              const registroConFolio = remoteResult.value;
              if (registroConFolio.folio) {
                console.log(`📝 Actualizando folio local: ${registroConFolio.folio} para registro ${registroConFolio.id}`);
                await this.localRepository.saveEntrada(registroConFolio);
              }

              // Marcar como sincronizado localmente
              await this.localRepository.markAsSynced(registro.id!);
              synced++;
            } else {
              failed++;
              errors.push({
                registroId: registro.id || 'unknown',
                error: remoteResult.error.message,
              });
            }
          } catch (error) {
            failed++;
            errors.push({
              registroId: registro.id || 'unknown',
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      }

      return ResultFactory.ok({
        synced,
        failed,
        errors,
      });
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }
}
