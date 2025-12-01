import type { Result } from '../shared/Result';
import type { Registro } from '../entities/Registro';

export interface PrinterInfo {
  name: string;
  displayName: string;
  description?: string;
  isDefault: boolean;
}

export interface TicketData {
  registro: Registro;
  empresa: string;
  printerName?: string;
}

/**
 * Interfaz para el servicio de impresión térmica
 * Abstrae la comunicación con impresoras térmicas
 */
export interface IPrinterService {
  /**
   * Lista las impresoras disponibles en el sistema
   */
  listPrinters(): Promise<Result<PrinterInfo[]>>;

  /**
   * Imprime un ticket térmico con los datos del registro
   */
  printTicket(data: TicketData): Promise<Result<void>>;

  /**
   * Obtiene la impresora configurada por defecto
   */
  getDefaultPrinter(): Promise<string | null>;

  /**
   * Establece la impresora por defecto
   */
  setDefaultPrinter(printerName: string): Promise<Result<void>>;
}
