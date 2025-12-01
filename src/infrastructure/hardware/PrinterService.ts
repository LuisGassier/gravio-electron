import type {
  IPrinterService,
  PrinterInfo,
  TicketData
} from '@/domain/hardware/IPrinterService';
import type { Result } from '@/domain/shared/Result';
import { ResultFactory } from '@/domain/shared/Result';

/**
 * Implementación del servicio de impresión térmica
 * Comunica con el main process de Electron a través de IPC
 */
export class PrinterService implements IPrinterService {
  private readonly STORAGE_KEY = 'defaultPrinter';
  private readonly AUTO_PRINT_KEY = 'autoPrintEnabled';

  async listPrinters(): Promise<Result<PrinterInfo[]>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('API de Electron no disponible'));
      }

      const printers = await window.electron.printer.list();

      const formattedPrinters: PrinterInfo[] = printers.map(p => ({
        name: p.name,
        displayName: p.displayName || p.name,
        description: p.description,
        isDefault: p.isDefault || false
      }));

      return ResultFactory.ok(formattedPrinters);
    } catch (error) {
      console.error('❌ Error al listar impresoras:', error);
      return ResultFactory.fail(
        error instanceof Error ? error : new Error('Error desconocido al listar impresoras')
      );
    }
  }

  async printTicket(data: TicketData): Promise<Result<void>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('API de Electron no disponible'));
      }

      // Si no se especifica impresora, usar la configurada por defecto
      let printerName = data.printerName;
      console.log('🖨️ printTicket llamado con printerName:', printerName);

      if (!printerName) {
        console.log('🔍 No se especificó impresora, buscando impresora por defecto...');
        printerName = await this.getDefaultPrinter() ?? undefined;
        console.log('🖨️ Impresora por defecto recuperada:', printerName);

        if (!printerName) {
          // Intentar listar impresoras para debug
          const printersResult = await this.listPrinters();
          console.error('❌ No hay impresora configurada');
          console.log('📋 Impresoras disponibles:', printersResult.success ? printersResult.value : 'Error al listar');

          return ResultFactory.fail(
            new Error('No hay impresora configurada. Configure una impresora en Ajustes.')
          );
        }
      }

      console.log('✅ Usando impresora:', printerName);

      const { registro, empresa, empresaClave, conceptoClave, conceptoNombre } = data;

      // Obtener configuración de la empresa que opera el software
      const companyName = await window.electron.storage.get('companyName') ?? undefined;
      const companyAddress = await window.electron.storage.get('companyAddress') ?? undefined;
      const companyLogo = await window.electron.storage.get('companyLogo') ?? undefined;

      // Obtener usuario actual desde almacenamiento
      const storedUser = await window.electron.storage.get('currentUser');
      const usuario = storedUser?.name || storedUser?.email || 'Sistema';

      // Preparar datos para el ticket
      const ticketData = {
        printerName,
        folio: registro.folio || 'PENDIENTE',
        fecha: registro.fechaSalida || new Date(),
        companyName,
        companyAddress,
        companyLogo,
        empresaClave: String(empresaClave),
        empresaNombre: empresa,
        conceptoClave: String(conceptoClave),
        conceptoNombre,
        vehiculo: {
          placas: registro.placaVehiculo || '',
          numeroEconomico: registro.numeroEconomico || ''
        },
        operadorClave: String(registro.claveOperador),
        operadorNombre: registro.operador,
        rutaClave: String(registro.claveRuta),
        rutaNombre: registro.ruta,
        pesos: {
          entrada: registro.pesoEntrada,
          salida: registro.pesoSalida,
          neto: registro.getPesoNeto()
        },
        fechaEntrada: registro.fechaEntrada,
        fechaSalida: registro.fechaSalida,
        observaciones: registro.observaciones,
        usuario
      };

      const success = await window.electron.printer.print(ticketData);

      if (!success) {
        return ResultFactory.fail(new Error('La impresora no pudo imprimir el ticket'));
      }

      return ResultFactory.ok(undefined);
    } catch (error) {
      console.error('❌ Error al imprimir ticket:', error);
      return ResultFactory.fail(
        error instanceof Error ? error : new Error('Error desconocido al imprimir')
      );
    }
  }

  async getDefaultPrinter(): Promise<string | null> {
    try {
      if (!window.electron) {
        return null;
      }

      const printerName = await window.electron.storage.get(this.STORAGE_KEY);
      console.log('🖨️ Impresora por defecto obtenida:', printerName);
      return printerName || null;
    } catch (error) {
      console.error('❌ Error al obtener impresora por defecto:', error);
      return null;
    }
  }

  async isAutoPrintEnabled(): Promise<boolean> {
    try {
      if (!window.electron) {
        return false;
      }

      const enabled = await window.electron.storage.get(this.AUTO_PRINT_KEY);
      console.log('🖨️ Impresión automática:', enabled);
      return enabled === true;
    } catch (error) {
      console.error('❌ Error al obtener configuración de impresión automática:', error);
      return false;
    }
  }

  async setAutoPrint(enabled: boolean): Promise<Result<void>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('API de Electron no disponible'));
      }

      await window.electron.storage.set(this.AUTO_PRINT_KEY, enabled);
      console.log('✅ Impresión automática configurada:', enabled);
      return ResultFactory.ok(undefined);
    } catch (error) {
      console.error('❌ Error al configurar impresión automática:', error);
      return ResultFactory.fail(
        error instanceof Error ? error : new Error('Error desconocido al configurar impresión automática')
      );
    }
  }

  async setDefaultPrinter(printerName: string): Promise<Result<void>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('API de Electron no disponible'));
      }

      // Verificar que la impresora existe
      const printersResult = await this.listPrinters();
      if (!printersResult.success) {
        return ResultFactory.fail(printersResult.error);
      }

      const exists = printersResult.value.some(p => p.name === printerName);
      if (!exists) {
        return ResultFactory.fail(
          new Error(`La impresora "${printerName}" no está disponible`)
        );
      }

      await window.electron.storage.set(this.STORAGE_KEY, printerName);
      return ResultFactory.ok(undefined);
    } catch (error) {
      console.error('❌ Error al guardar impresora por defecto:', error);
      return ResultFactory.fail(
        error instanceof Error ? error : new Error('Error desconocido al guardar impresora')
      );
    }
  }
}
