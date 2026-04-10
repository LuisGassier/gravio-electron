import type { Result } from '../../domain/shared/Result'
import { ResultFactory } from '../../domain/shared/Result'
import { supabase } from '../../lib/supabase'

/**
 * Servicio para detectar conectividad de red
 * Verifica si hay internet y si Supabase está disponible
 */
export class NetworkService {
  private _isOnline: boolean = true
  private lastCheck: Date = new Date()
  private readonly checkIntervalMs: number = 10000 // 10 segundos

  /**
   * Verifica si hay conexión a internet y Supabase está disponible
   * Cachea el resultado por 30 segundos para no sobrecargar
   */
  async isOnline(): Promise<boolean> {
    const now = new Date()
    const timeSinceLastCheck = now.getTime() - this.lastCheck.getTime()

    // Si el último check fue hace menos de 30 segundos, usar valor cacheado
    if (timeSinceLastCheck < this.checkIntervalMs) {
      return this._isOnline
    }

    // Hacer nuevo check
    const result = await this.checkConnectivity()
    this._isOnline = result.success && result.value
    this.lastCheck = now

    return this._isOnline
  }

  /**
   * Fuerza una verificación de conectividad sin usar caché
   */
  async checkConnectivity(): Promise<Result<boolean>> {
    try {
      // 1. Verificar si el navegador reporta estar online
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.log('🔴 Navigator.onLine reporta sin conexión')
        return ResultFactory.ok(false)
      }

      // 2. Intentar hacer ping a Supabase con timeout corto
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 segundos timeout

      try {
        // Hacer una query simple a Supabase
        const { error } = await supabase
          .from('empresa')
          .select('id')
          .limit(1)
          .abortSignal(controller.signal)

        clearTimeout(timeoutId)

        if (error) {
          console.log('🔴 Supabase no disponible:', error.message)
          return ResultFactory.ok(false)
        }

        console.log('🟢 Conectividad verificada - Online')
        return ResultFactory.ok(true)
      } catch (error) {
        clearTimeout(timeoutId)
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.log('🔴 Timeout al verificar Supabase')
          } else {
            console.log('🔴 Error al verificar Supabase:', error.message)
          }
        }
        
        return ResultFactory.ok(false)
      }
    } catch (error) {
      console.error('❌ Error al verificar conectividad:', error)
      return ResultFactory.ok(false)
    }
  }

  /**
   * Obtiene el estado actual de conectividad (sin hacer check)
   */
  getCurrentStatus(): boolean {
    return this._isOnline
  }

  /**
   * Reinicia el caché de conectividad
   */
  resetCache(): void {
    this.lastCheck = new Date(0) // Fecha antigua para forzar nuevo check
  }

  /**
   * Suscribe un callback para cambios en el estado de navegador.onLine
   * Solo funciona si estamos en un entorno con window
   */
  subscribeToNavigatorEvents(callback: (isOnline: boolean) => void): () => void {
    if (typeof window === 'undefined') {
      return () => {} // No-op si no hay window
    }

    const handleOnline = () => {
      console.log('🟢 Evento: navegador reporta ONLINE')
      this._isOnline = true
      this.lastCheck = new Date()
      callback(true)
    }

    const handleOffline = () => {
      console.log('🔴 Evento: navegador reporta OFFLINE')
      this._isOnline = false
      this.lastCheck = new Date()
      callback(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Retornar función de limpieza
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }
}
