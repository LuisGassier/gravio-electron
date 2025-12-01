import type { IWeightReader } from '../../domain/hardware/IWeightReader';

/**
 * Adapter para báscula Mettler Toledo
 * Implementa la interfaz IWeightReader usando el IPC bridge de Electron
 *
 * Formato esperado: )0 1050 0500 → 1050.0500 kg
 */
export class MettlerToledoScale implements IWeightReader {
  private currentWeight: number | null = null;
  private connected: boolean = false;
  private lastError: string | null = null;
  private cleanupCallback: (() => void) | null = null;

  /**
   * Abre la conexión con la báscula
   */
  async open(port: string, baudRate: number): Promise<void> {
    try {
      const result = await window.electron.serialPort.open(port, baudRate);

      if (!result.success) {
        this.lastError = result.error || 'Error desconocido al abrir puerto';
        throw new Error(this.lastError);
      }

      this.connected = true;
      this.lastError = null;
    } catch (error) {
      this.connected = false;
      this.lastError = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  /**
   * Cierra la conexión con la báscula
   */
  async close(): Promise<void> {
    try {
      if (this.cleanupCallback) {
        this.cleanupCallback();
        this.cleanupCallback = null;
      }

      const result = await window.electron.serialPort.close();

      if (!result.success) {
        this.lastError = result.error || 'Error al cerrar puerto';
        throw new Error(this.lastError);
      }

      this.connected = false;
      this.currentWeight = null;
      this.lastError = null;
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  /**
   * Obtiene el peso actual
   */
  getCurrentWeight(): number | null {
    return this.currentWeight;
  }

  /**
   * Registra un callback para recibir actualizaciones de peso
   */
  onWeightUpdate(callback: (weight: number) => void): void {
    // Remover listener anterior si existe
    if (this.cleanupCallback) {
      this.cleanupCallback();
    }

    // Registrar nuevo listener
    this.cleanupCallback = window.electron.serialPort.onData((data: string) => {
      const weight = parseFloat(data);
      if (!isNaN(weight)) {
        this.currentWeight = weight;
        callback(weight);
      }
    });
  }

  /**
   * Verifica si está conectado
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Obtiene el último error
   */
  getLastError(): string | null {
    return this.lastError;
  }

  /**
   * Lista los puertos disponibles
   */
  async listPorts(): Promise<Array<{ path: string; manufacturer?: string }>> {
    try {
      const result = await window.electron.serialPort.list();

      if (!result.success) {
        this.lastError = result.error || 'Error al listar puertos';
        return [];
      }

      return result.ports || [];
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : String(error);
      return [];
    }
  }
}
