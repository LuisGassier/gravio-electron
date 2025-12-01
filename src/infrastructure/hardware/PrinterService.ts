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
      if (!printerName) {
        printerName = await this.getDefaultPrinter();
        if (!printerName) {
          return ResultFactory.fail(
            new Error('No hay impresora configurada. Configure una impresora en Ajustes.')
          );
        }
      }

      const { registro, empresa } = data;

      // Preparar datos para el ticket
      const ticketData = {
        printerName,
        folio: registro.folio || 'PENDIENTE',
        fecha: registro.fechaSalida || new Date(),
        empresa,
        vehiculo: {
          placas: registro.placaVehiculo,
          numeroEconomico: registro.numeroEconomico
        },
        operador: registro.operador,
        ruta: registro.ruta,
        pesos: {
          entrada: registro.pesoEntrada,
          salida: registro.pesoSalida,
          neto: registro.getPesoNeto()
        },
        fechaEntrada: registro.fechaEntrada,
        fechaSalida: registro.fechaSalida,
        observaciones: registro.observaciones
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
      return printerName || null;
    } catch (error) {
      console.error('❌ Error al obtener impresora por defecto:', error);
      return null;
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
