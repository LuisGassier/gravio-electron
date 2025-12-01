/**
 * Interfaz para lectores de peso (básculas)
 * Permite intercambiar implementaciones (Mettler Toledo, otra marca, simulador)
 */
export interface IWeightReader {
  /**
   * Abre la conexión con la báscula
   */
  open(port: string, baudRate: number): Promise<void>;

  /**
   * Cierra la conexión
   */
  close(): Promise<void>;

  /**
   * Lee el peso actual de forma síncrona
   */
  getCurrentWeight(): number | null;

  /**
   * Registra un callback para recibir actualizaciones de peso
   */
  onWeightUpdate(callback: (weight: number) => void): void;

  /**
   * Verifica si está conectado
   */
  isConnected(): boolean;

  /**
   * Obtiene el último error
   */
  getLastError(): string | null;
}
