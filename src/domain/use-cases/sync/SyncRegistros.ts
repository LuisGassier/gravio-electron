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

  async execute(): Promise<Result<SyncRegistrosOutput>> {
    try {
      // Obtener registros no sincronizados
      const unsyncedResult = await this.localRepository.findUnsynchronized();

      if (!unsyncedResult.success) {
        return unsyncedResult as any;
      }

      const unsyncedRegistros = unsyncedResult.value;

      if (unsyncedRegistros.length === 0) {
        return ResultFactory.ok({
          synced: 0,
          failed: 0,
          errors: [],
        });
      }

      let synced = 0;
      let failed = 0;
      const errors: Array<{ registroId: string; error: string }> = [];

      // Sincronizar cada registro
      for (const registro of unsyncedRegistros) {
        try {
          // Intentar guardar en Supabase
          // Si es entrada, Supabase generará el folio
          const remoteResult = await this.remoteRepository.saveEntrada(registro);

          if (remoteResult.success) {
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
