import { SyncRegistrosUseCase } from '../../domain/use-cases/sync/SyncRegistros';
import type { FolioService } from './FolioService';

// Importar funciones para actualizar el estado global de sync
let updateGlobalSyncStatus: ((lastSync: Date) => void) | null = null;

// Función para registrar el callback de actualización
export function registerGlobalSyncUpdate(callback: (lastSync: Date) => void) {
  updateGlobalSyncStatus = callback;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: Array<{ registroId: string; error: string }>;
  timestamp: Date;
  foliosSynced?: number;
}

/**
 * Servicio de sincronización mejorado
 * Orquesta la sincronización entre SQLite y Supabase
 */
export class SyncService {
  private isSyncing: boolean = false;
  private lastSyncResult: SyncResult | null = null;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private readonly syncRegistrosUseCase: SyncRegistrosUseCase;
  private readonly folioService: FolioService;
  private readonly autoSyncIntervalMs: number;

  constructor(
    syncRegistrosUseCase: SyncRegistrosUseCase,
    folioService: FolioService,
    autoSyncIntervalMs: number = 5 * 60 * 1000 // 5 minutos por defecto
  ) {
    this.syncRegistrosUseCase = syncRegistrosUseCase;
    this.folioService = folioService;
    this.autoSyncIntervalMs = autoSyncIntervalMs;
  }

  /**
   * Inicia la sincronización automática
   */
  startAutoSync(): void {
    if (this.syncInterval) {
      console.warn('Auto-sync ya está activo');
      return;
    }

    console.log(`Iniciando auto-sync cada ${this.autoSyncIntervalMs / 1000} segundos`);

    // Ejecutar sincronización inmediata
    this.syncNow().catch((error) => {
      console.error('Error en sincronización inicial:', error);
    });

    // Programar sincronizaciones periódicas
    this.syncInterval = setInterval(() => {
      this.syncNow().catch((error) => {
        console.error('Error en sincronización automática:', error);
      });
    }, this.autoSyncIntervalMs);
  }

  /**
   * Detiene la sincronización automática
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Auto-sync detenido');
    }
  }

  /**
   * Sincroniza SOLO un registro específico (optimizado para flujo de pesaje)
   * @param registroId ID del registro a sincronizar
   */
  async syncSingleRegistro(registroId: string): Promise<SyncResult> {
    try {
      // No bloquear si hay sincronización en progreso, esto es prioritario
      const result = await this.syncRegistrosUseCase.executeSingle(registroId);

      const syncResult: SyncResult = {
        success: result.success,
        synced: result.success ? 1 : 0,
        failed: result.success ? 0 : 1,
        errors: result.success ? [] : [{ registroId, error: result.error.message }],
        timestamp: new Date(),
      };

      if (syncResult.success) {
        console.log(`✅ Registro ${registroId} sincronizado exitosamente`);
      }

      return syncResult;
    } catch (error) {
      return {
        success: false,
        synced: 0,
        failed: 1,
        errors: [
          {
            registroId,
            error: error instanceof Error ? error.message : String(error),
          },
        ],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Ejecuta una sincronización inmediata
   */
  async syncNow(): Promise<SyncResult> {
    if (this.isSyncing) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: [{ registroId: 'system', error: 'Ya hay una sincronización en progreso' }],
        timestamp: new Date(),
      };
    }

    this.isSyncing = true;

    try {
      // 1. Sincronizar registros
      const result = await this.syncRegistrosUseCase.execute();

      // 2. Sincronizar secuencias de folios
      let foliosSynced = 0;
      try {
        const foliosResult = await this.folioService.syncSequences();
        if (foliosResult.success) {
          foliosSynced = foliosResult.value.synced;
          console.log(`✅ Secuencias de folios sincronizadas: ${foliosSynced}`);
        }
      } catch (error) {
        console.warn('⚠️ Error al sincronizar secuencias de folios:', error);
      }

      const syncResult: SyncResult = {
        success: result.success,
        synced: result.success ? result.value.synced : 0,
        failed: result.success ? result.value.failed : 1,
        errors: result.success ? result.value.errors : [{ registroId: 'unknown', error: result.error.message }],
        timestamp: new Date(),
        foliosSynced,
      };

      this.lastSyncResult = syncResult;

      // Actualizar estado global de sync.ts
      if (updateGlobalSyncStatus) {
        updateGlobalSyncStatus(syncResult.timestamp);
      }

      if (syncResult.synced > 0) {
        console.log(`✅ Sincronización exitosa: ${syncResult.synced} registros`);
      }

      if (syncResult.failed > 0) {
        console.warn(`⚠️ Sincronización con errores: ${syncResult.failed} fallidos`);
        syncResult.errors.forEach((error) => {
          console.error(`  - ${error.registroId}: ${error.error}`);
        });
      }

      return syncResult;
    } catch (error) {
      const syncResult: SyncResult = {
        success: false,
        synced: 0,
        failed: 1,
        errors: [
          {
            registroId: 'system',
            error: error instanceof Error ? error.message : String(error),
          },
        ],
        timestamp: new Date(),
      };

      this.lastSyncResult = syncResult;
      return syncResult;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Obtiene el resultado de la última sincronización
   */
  getLastSyncResult(): SyncResult | null {
    return this.lastSyncResult;
  }

  /**
   * Verifica si hay una sincronización en progreso
   */
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  /**
   * Verifica si el auto-sync está activo
   */
  isAutoSyncActive(): boolean {
    return this.syncInterval !== null;
  }
}
