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

      // 2. Verificar si el registro ya existe en Supabase
      const existingRemote = await this.remoteRepository.findById(registroId);
      let remoteResult: Result<any>;
      
      if (existingRemote.success && existingRemote.value) {
        // 🔍 Ya existe en Supabase
        console.log(`✅ Registro ${registroId} ya existe en Supabase`);
        
        if (registro.isCompleto() && !existingRemote.value.pesoSalida) {
          // Tiene salida local pero no remota - actualizar
          console.log(`🔄 Actualizando salida en Supabase para registro ${registroId}`);
          remoteResult = await this.remoteRepository.updateWithSalida(
            registroId,
            registro.pesoSalida!,
            registro.fechaSalida!,
            registro.observaciones
          );
        } else {
          // Ya está sincronizado - retornar el existente
          console.log(`⏭️ Registro ${registroId} ya sincronizado en Supabase`);
          remoteResult = ResultFactory.ok(existingRemote.value);
        }
      } else {
        // 📥 No existe en Supabase - crear nuevo
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

      // FASE 1: Descargar registros pendientes de Supabase → SQLite
      try {
        const remotePendingResult = await this.remoteRepository.findAllPending();
        
        if (remotePendingResult.success && remotePendingResult.value.length > 0) {
          
          for (const remoteRegistro of remotePendingResult.value) {
            try {
              // Verificar si el registro ya existe localmente
              const localExistingResult = await this.localRepository.findById(remoteRegistro.id!);
              
              // Si existe localmente y ya tiene salida, NO sobrescribir
              if (localExistingResult.success && localExistingResult.value) {
                const localRegistro = localExistingResult.value;
                if (localRegistro.pesoSalida && localRegistro.fechaSalida) {
                  // El registro local tiene salida, no sobrescribir con la versión pendiente de Supabase
                  continue;
                }
              }
              
              // Guardar/actualizar en SQLite local solo si no tiene salida local
              const localResult = await this.localRepository.saveEntrada(remoteRegistro);
              
              if (localResult.success) {
                synced++;
              } else {
                failed++;
                errors.push({
                  registroId: remoteRegistro.id || 'unknown',
                  error: `Error al guardar localmente: ${localResult.error.message}`,
                });
              }
            } catch (error) {
              failed++;
              errors.push({
                registroId: remoteRegistro.id || 'unknown',
                error: error instanceof Error ? error.message : String(error),
              });
            }
          }
        }
      } catch (error) {
        // Silenciar error de descarga
      }

      // FASE 2: Subir registros no sincronizados de SQLite → Supabase
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
