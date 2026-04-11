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
 * 2. Enviarlos a Supabase con el folio ya asignado (offline-first — SQLite es fuente de verdad)
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
        
        // Si el UPDATE falla (registro no existe en remoto), intentar INSERT
        if (!remoteResult.success) {
          console.log(`📥 UPDATE falló (${remoteResult.error?.message}), intentando INSERT`);
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

      const registroRemoto = remoteResult.value;

      // 3. Si tenía folio temporal, actualizar local con el folio definitivo de Supabase
      if (registro.folio?.startsWith('TEMP-') && registroRemoto.folio) {
        console.log(`📝 Reemplazando folio temporal ${registro.folio} → ${registroRemoto.folio}`);
        await this.localRepository.saveEntrada({ ...registroRemoto, sincronizado: false } as any);
      }

      // 4. Marcar como sincronizado
      await this.localRepository.markAsSynced(registroId);

      return ResultFactory.ok({ folio: registroRemoto.folio ?? registro.folio });
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
            let remoteResult: Result<any>;

            if (registro.isCompleto()) {
              // Registro completo: intentar UPDATE con salida primero
              remoteResult = await this.remoteRepository.updateWithSalida(
                registro.id!,
                registro.pesoSalida!,
                registro.fechaSalida!,
                registro.observaciones
              );
              // Si no existe en remoto, crear entrada completa
              if (!remoteResult.success) {
                remoteResult = await this.remoteRepository.saveEntrada(registro);
              }
            } else {
              // Solo entrada
              remoteResult = await this.remoteRepository.saveEntrada(registro);
            }

            if (remoteResult.success) {
              const registroRemoto = remoteResult.value;
              // Si tenía folio temporal, actualizar el local con el folio definitivo de Supabase
              if (registro.folio?.startsWith('TEMP-') && registroRemoto.folio) {
                console.log(`📝 Reemplazando folio temporal ${registro.folio} → ${registroRemoto.folio}`);
                await this.localRepository.saveEntrada({ ...registroRemoto, sincronizado: false } as any);
              }
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
