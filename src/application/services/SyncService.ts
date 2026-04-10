import { SyncRegistrosUseCase } from '../../domain/use-cases/sync/SyncRegistros';
import type { FolioService } from './FolioService';
import type { SQLiteRegistroRepository } from '../../infrastructure/database/SQLiteRegistroRepository';
import type { SupabaseRegistroRepository } from '../../infrastructure/database/SupabaseRegistroRepository';

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

export interface RepararSyncProgress {
  total: number;
  procesados: number;
  subidos: number;
  yaExistian: number;
  fallidos: number;
  done: boolean;
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
  private _localRepo?: SQLiteRegistroRepository;
  private _remoteRepo?: SupabaseRegistroRepository;

  // Progreso del reparar sync — null si no está corriendo
  private _repararProgress: RepararSyncProgress | null = null;
  private _repararCallbacks: Array<(p: RepararSyncProgress) => void> = [];

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
   * Inyectar repositorios necesarios para repararSync
   */
  setRepositories(local: SQLiteRegistroRepository, remote: SupabaseRegistroRepository): void {
    this._localRepo = local;
    this._remoteRepo = remote;
  }

  /**
   * Suscribirse al progreso de repararSync
   */
  onRepararProgress(cb: (p: RepararSyncProgress) => void): () => void {
    this._repararCallbacks.push(cb);
    // Si ya hay progreso activo, enviar el estado actual inmediatamente
    if (this._repararProgress) cb(this._repararProgress);
    return () => {
      this._repararCallbacks = this._repararCallbacks.filter(c => c !== cb);
    };
  }

  getRepararProgress(): RepararSyncProgress | null {
    return this._repararProgress;
  }

  private _emitProgress(p: RepararSyncProgress) {
    this._repararProgress = p;
    this._repararCallbacks.forEach(cb => cb(p));
  }

  /**
   * Verifica todos los registros locales contra Supabase y sube los faltantes.
   * Corre en background — fire-and-forget. Progreso via onRepararProgress().
   */
  repararSync(): void {
    if (!this._localRepo || !this._remoteRepo) {
      console.error('❌ repararSync: repositorios no configurados');
      return;
    }
    if (this._repararProgress && !this._repararProgress.done) {
      console.warn('⚠️ repararSync ya está corriendo');
      return;
    }

    // Lanzar en background
    this._doRepararSync().catch(err => {
      console.error('❌ Error en repararSync:', err);
      this._emitProgress({
        total: 0, procesados: 0, subidos: 0, yaExistian: 0, fallidos: 1, done: true
      });
    });
  }

  private async _doRepararSync(): Promise<void> {
    const localRepo = this._localRepo!;
    const remoteRepo = this._remoteRepo!;

    const todosResult = await localRepo.findAll();
    if (!todosResult.success || !todosResult.value) {
      console.error('❌ repararSync: no se pudo leer SQLite');
      return;
    }

    const todos = todosResult.value;
    let procesados = 0, subidos = 0, yaExistian = 0, fallidos = 0;

    this._emitProgress({ total: todos.length, procesados, subidos, yaExistian, fallidos, done: false });

    for (const reg of todos) {
      if (!reg.id) { procesados++; continue; }
      try {
        // Verificar si existe en Supabase por ID
        const remoteCheck = await remoteRepo.findById(reg.id);
        const existeEnRemoto = remoteCheck.success && remoteCheck.value !== null;

        if (existeEnRemoto) {
          // Ya existe — asegurar que local esté marcado como sincronizado
          if (!reg.sincronizado) {
            await window.electron.db.run('UPDATE registros SET sincronizado = 1 WHERE id = ?', [reg.id]);
          }
          yaExistian++;
        } else {
          // No existe en remoto — subir
          const result = await this.syncSingleRegistro(reg.id);
          if (result.success) {
            subidos++;
          } else {
            fallidos++;
            console.warn(`❌ repararSync: no se pudo subir ${reg.folio}:`, result.errors[0]?.error);
          }
        }
      } catch (err) {
        fallidos++;
        console.warn(`❌ repararSync: error procesando ${reg.id}:`, err);
      }

      procesados++;
      this._emitProgress({ total: todos.length, procesados, subidos, yaExistian, fallidos, done: false });
    }

    this._emitProgress({ total: todos.length, procesados, subidos, yaExistian, fallidos, done: true });
    console.log(`✅ repararSync completado: ${subidos} subidos, ${yaExistian} ya existían, ${fallidos} fallidos`);
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
