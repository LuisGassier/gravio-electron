/**
 * Contenedor de Inyección de Dependencias
 * Configura e instancia todos los servicios de la aplicación
 */

import { SQLiteRegistroRepository } from '../infrastructure/database/SQLiteRegistroRepository';
import { SupabaseRegistroRepository } from '../infrastructure/database/SupabaseRegistroRepository';
import { SQLiteVehiculoRepository } from '../infrastructure/database/SQLiteVehiculoRepository';
import { SupabaseVehiculoRepository } from '../infrastructure/database/SupabaseVehiculoRepository';
import { SQLiteOperadorRepository } from '../infrastructure/database/SQLiteOperadorRepository';
import { SupabaseOperadorRepository } from '../infrastructure/database/SupabaseOperadorRepository';
import { SQLiteRutaRepository } from '../infrastructure/database/SQLiteRutaRepository';
import { SupabaseRutaRepository } from '../infrastructure/database/SupabaseRutaRepository';
import { SQLiteEmpresaRepository } from '../infrastructure/database/SQLiteEmpresaRepository';
import { SupabaseEmpresaRepository } from '../infrastructure/database/SupabaseEmpresaRepository';
import { MettlerToledoScale } from '../infrastructure/hardware/MettlerToledoScale';
import { PrinterService } from '../infrastructure/hardware/PrinterService';

import { CreateEntradaUseCase } from '../domain/use-cases/registro/CreateEntrada';
import { CompleteWithSalidaUseCase } from '../domain/use-cases/registro/CompleteWithSalida';
import { FindPendingRegistrosUseCase } from '../domain/use-cases/registro/FindPendingRegistros';
import { SyncRegistrosUseCase } from '../domain/use-cases/sync/SyncRegistros';

import { PesajeService } from '../application/services/PesajeService';
import { SyncService } from '../application/services/SyncService';

/**
 * Singleton container para toda la aplicación
 */
class DIContainer {
  // Repositories - Registro
  private _sqliteRegistroRepository?: SQLiteRegistroRepository;
  private _supabaseRegistroRepository?: SupabaseRegistroRepository;

  // Repositories - Vehiculo
  private _sqliteVehiculoRepository?: SQLiteVehiculoRepository;
  private _supabaseVehiculoRepository?: SupabaseVehiculoRepository;

  // Repositories - Operador
  private _sqliteOperadorRepository?: SQLiteOperadorRepository;
  private _supabaseOperadorRepository?: SupabaseOperadorRepository;

  // Repositories - Ruta
  private _sqliteRutaRepository?: SQLiteRutaRepository;
  private _supabaseRutaRepository?: SupabaseRutaRepository;

  // Repositories - Empresa
  private _sqliteEmpresaRepository?: SQLiteEmpresaRepository;
  private _supabaseEmpresaRepository?: SupabaseEmpresaRepository;

  // Hardware
  private _mettlerToledoScale?: MettlerToledoScale;
  private _printerService?: PrinterService;

  // Use Cases
  private _createEntradaUseCase?: CreateEntradaUseCase;
  private _completeWithSalidaUseCase?: CompleteWithSalidaUseCase;
  private _findPendingRegistrosUseCase?: FindPendingRegistrosUseCase;
  private _syncRegistrosUseCase?: SyncRegistrosUseCase;

  // Services
  private _pesajeService?: PesajeService;
  private _syncService?: SyncService;

  // Repositories - Registro
  get sqliteRegistroRepository(): SQLiteRegistroRepository {
    if (!this._sqliteRegistroRepository) {
      this._sqliteRegistroRepository = new SQLiteRegistroRepository();
    }
    return this._sqliteRegistroRepository;
  }

  get supabaseRegistroRepository(): SupabaseRegistroRepository {
    if (!this._supabaseRegistroRepository) {
      this._supabaseRegistroRepository = new SupabaseRegistroRepository();
    }
    return this._supabaseRegistroRepository;
  }

  // Repositories - Vehiculo
  get sqliteVehiculoRepository(): SQLiteVehiculoRepository {
    if (!this._sqliteVehiculoRepository) {
      this._sqliteVehiculoRepository = new SQLiteVehiculoRepository();
    }
    return this._sqliteVehiculoRepository;
  }

  get supabaseVehiculoRepository(): SupabaseVehiculoRepository {
    if (!this._supabaseVehiculoRepository) {
      this._supabaseVehiculoRepository = new SupabaseVehiculoRepository();
    }
    return this._supabaseVehiculoRepository;
  }

  // Repositories - Operador
  get sqliteOperadorRepository(): SQLiteOperadorRepository {
    if (!this._sqliteOperadorRepository) {
      this._sqliteOperadorRepository = new SQLiteOperadorRepository();
    }
    return this._sqliteOperadorRepository;
  }

  get supabaseOperadorRepository(): SupabaseOperadorRepository {
    if (!this._supabaseOperadorRepository) {
      this._supabaseOperadorRepository = new SupabaseOperadorRepository();
    }
    return this._supabaseOperadorRepository;
  }

  // Repositories - Ruta
  get sqliteRutaRepository(): SQLiteRutaRepository {
    if (!this._sqliteRutaRepository) {
      this._sqliteRutaRepository = new SQLiteRutaRepository();
    }
    return this._sqliteRutaRepository;
  }

  get supabaseRutaRepository(): SupabaseRutaRepository {
    if (!this._supabaseRutaRepository) {
      this._supabaseRutaRepository = new SupabaseRutaRepository();
    }
    return this._supabaseRutaRepository;
  }

  // Repositories - Empresa
  get sqliteEmpresaRepository(): SQLiteEmpresaRepository {
    if (!this._sqliteEmpresaRepository) {
      this._sqliteEmpresaRepository = new SQLiteEmpresaRepository();
    }
    return this._sqliteEmpresaRepository;
  }

  get supabaseEmpresaRepository(): SupabaseEmpresaRepository {
    if (!this._supabaseEmpresaRepository) {
      this._supabaseEmpresaRepository = new SupabaseEmpresaRepository();
    }
    return this._supabaseEmpresaRepository;
  }

  // Hardware
  get mettlerToledoScale(): MettlerToledoScale {
    if (!this._mettlerToledoScale) {
      this._mettlerToledoScale = new MettlerToledoScale();
    }
    return this._mettlerToledoScale;
  }

  get printerService(): PrinterService {
    if (!this._printerService) {
      this._printerService = new PrinterService();
    }
    return this._printerService;
  }

  // Use Cases
  get createEntradaUseCase(): CreateEntradaUseCase {
    if (!this._createEntradaUseCase) {
      this._createEntradaUseCase = new CreateEntradaUseCase(
        this.sqliteRegistroRepository
      );
    }
    return this._createEntradaUseCase;
  }

  get completeWithSalidaUseCase(): CompleteWithSalidaUseCase {
    if (!this._completeWithSalidaUseCase) {
      this._completeWithSalidaUseCase = new CompleteWithSalidaUseCase(
        this.sqliteRegistroRepository
      );
    }
    return this._completeWithSalidaUseCase;
  }

  get findPendingRegistrosUseCase(): FindPendingRegistrosUseCase {
    if (!this._findPendingRegistrosUseCase) {
      this._findPendingRegistrosUseCase = new FindPendingRegistrosUseCase(
        this.sqliteRegistroRepository
      );
    }
    return this._findPendingRegistrosUseCase;
  }

  get syncRegistrosUseCase(): SyncRegistrosUseCase {
    if (!this._syncRegistrosUseCase) {
      this._syncRegistrosUseCase = new SyncRegistrosUseCase(
        this.sqliteRegistroRepository,
        this.supabaseRegistroRepository
      );
    }
    return this._syncRegistrosUseCase;
  }

  // Services
  get pesajeService(): PesajeService {
    if (!this._pesajeService) {
      this._pesajeService = new PesajeService(
        this.createEntradaUseCase,
        this.completeWithSalidaUseCase,
        this.findPendingRegistrosUseCase,
        this.mettlerToledoScale
      );
    }
    return this._pesajeService;
  }

  get syncService(): SyncService {
    if (!this._syncService) {
      this._syncService = new SyncService(
        this.syncRegistrosUseCase,
        5 * 60 * 1000 // 5 minutos
      );
    }
    return this._syncService;
  }

  /**
   * Inicializa todos los servicios necesarios
   */
  async initialize(): Promise<void> {
    console.log('🚀 Inicializando contenedor de dependencias...');

    // Inicializar báscula (no bloqueante) - leer configuración guardada
    try {
      const savedPort = await window.electron?.storage.get('serialPort');
      const savedBaudRate = await window.electron?.storage.get('baudRate');
      
      // Usar configuración guardada o valores por defecto
      const comPort = savedPort || import.meta.env.VITE_COM_PORT || 'COM2';
      const baudRate = savedBaudRate || 2400;

      console.log(`📡 Intentando conectar báscula en ${comPort}...`);
      await this.mettlerToledoScale.open(comPort, baudRate);
      console.log('✅ Báscula conectada correctamente');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️ Báscula no disponible: ${errorMsg}`);
      console.warn('ℹ️ La aplicación funcionará sin báscula (usar peso manual)');
      console.warn('💡 Configura el puerto serial en el panel de Configuración');
    }

    // Iniciar sincronización automática (no bloqueante)
    try {
      console.log('🔄 Iniciando sincronización automática...');
      this.syncService.startAutoSync();
      console.log('✅ Sincronización automática iniciada');
    } catch (error) {
      console.warn('⚠️ Error al iniciar sincronización automática:', error);
    }

    console.log('✅ Contenedor de dependencias inicializado');
  }

  /**
   * Limpia y libera recursos
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Limpiando recursos...');

    try {
      // Detener sincronización
      if (this._syncService) {
        this._syncService.stopAutoSync();
      }

      // Cerrar báscula
      if (this._mettlerToledoScale && this._mettlerToledoScale.isConnected()) {
        await this._mettlerToledoScale.close();
      }

      console.log('✅ Recursos liberados correctamente');
    } catch (error) {
      console.error('❌ Error al limpiar recursos:', error);
    }
  }
}

// Exportar instancia singleton
export const container = new DIContainer();
