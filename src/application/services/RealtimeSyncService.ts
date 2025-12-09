import type { Result } from '../../domain/shared/Result'
import { ResultFactory } from '../../domain/shared/Result'
import { supabase } from '../../lib/supabase'
import type { NetworkService } from './NetworkService'
import type { SyncService } from './SyncService'
import type { FolioService } from './FolioService'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Servicio de sincronización en tiempo real con Supabase
 *
 * Responsabilidades:
 * 1. Escuchar cambios en Supabase Realtime para tabla `registros`
 * 2. Sincronizar automáticamente cuando se detecta conexión
 * 3. Mantener secuencias de folios actualizadas en tiempo real
 * 4. Resolver conflictos: Supabase gana cuando tiene más información
 */
export class RealtimeSyncService {
  private readonly networkService: NetworkService
  private readonly syncService: SyncService
  private readonly folioService: FolioService

  private realtimeChannel: RealtimeChannel | null = null
  private folioChannel: RealtimeChannel | null = null
  private isSubscribed = false

  // Callbacks para notificar cambios
  private onRegistroUpdatedCallbacks: Array<(registroId: string) => void> = []
  private onFolioUpdatedCallbacks: Array<(claveEmpresa: number, ultimoNumero: number) => void> = []

  constructor(
    networkService: NetworkService,
    syncService: SyncService,
    folioService: FolioService
  ) {
    this.networkService = networkService
    this.syncService = syncService
    this.folioService = folioService

    // Detectar cambios de conectividad
    this.setupNetworkListener()
  }

  /**
   * Inicializar sincronización en tiempo real
   */
  async start(): Promise<Result<void>> {
    if (!supabase) {
      console.warn('⚠️ Supabase no disponible - Realtime deshabilitado')
      return ResultFactory.ok(undefined)
    }

    try {
      // Suscribirse a cambios en tabla registros
      await this.subscribeToRegistros()

      // Suscribirse a cambios en secuencias de folios (si tienes tabla folio_sequences)
      await this.subscribeToFolioSequences()

      console.log('✅ Realtime sync iniciado')
      return ResultFactory.ok(undefined)
    } catch (error) {
      console.error('❌ Error al iniciar Realtime sync:', error)
      return ResultFactory.fromError(error)
    }
  }

  /**
   * Detener sincronización en tiempo real
   */
  async stop(): Promise<Result<void>> {
    try {
      if (this.realtimeChannel) {
        await supabase?.removeChannel(this.realtimeChannel)
        this.realtimeChannel = null
      }

      if (this.folioChannel) {
        await supabase?.removeChannel(this.folioChannel)
        this.folioChannel = null
      }

      this.isSubscribed = false
      console.log('✅ Realtime sync detenido')
      return ResultFactory.ok(undefined)
    } catch (error) {
      console.error('❌ Error al detener Realtime sync:', error)
      return ResultFactory.fromError(error)
    }
  }

  /**
   * Suscribirse a cambios en tabla registros
   */
  private async subscribeToRegistros(): Promise<void> {
    if (!supabase) return

    this.realtimeChannel = supabase
      .channel('registros-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'registros'
        },
        async (payload) => {
          console.log('📡 Cambio detectado en Supabase:', payload)

          if (payload.eventType === 'INSERT') {
            await this.handleRemoteInsert(payload.new)
          } else if (payload.eventType === 'UPDATE') {
            await this.handleRemoteUpdate(payload.new, payload.old)
          } else if (payload.eventType === 'DELETE') {
            await this.handleRemoteDelete(payload.old)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.isSubscribed = true
          console.log('✅ Suscrito a cambios en registros')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error en canal Realtime')
        } else if (status === 'TIMED_OUT') {
          console.warn('⚠️ Timeout en canal Realtime')
        }
      })
  }

  /**
   * Suscribirse a cambios en secuencias de folios
   */
  private async subscribeToFolioSequences(): Promise<void> {
    if (!supabase) return

    this.folioChannel = supabase
      .channel('folio-sequences-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'folio_sequences'
        },
        async (payload) => {
          console.log('📡 Secuencia de folio actualizada:', payload)

          const { clave_empresa, ultimo_numero } = payload.new

          // Actualizar secuencia local
          await this.folioService.syncSequences()

          // Notificar a listeners
          this.onFolioUpdatedCallbacks.forEach(cb => cb(clave_empresa, ultimo_numero))
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Suscrito a cambios en secuencias de folios')
        }
      })
  }

  /**
   * Manejar INSERT remoto desde Supabase
   * Solo actualizar local si no existe o si es más reciente
   */
  private async handleRemoteInsert(registro: any): Promise<void> {
    try {
      // Verificar si ya existe localmente
      const localExists = await window.electron.db.get(
        'SELECT id, updated_at FROM registros WHERE id = ?',
        [registro.id]
      )

      if (!localExists) {
        // No existe localmente - insertar
        console.log(`📥 Insertando registro remoto ${registro.id} (folio: ${registro.folio})`)
        await this.insertLocalFromRemote(registro)
      } else {
        console.log(`⏭️ Registro ${registro.id} ya existe localmente - ignorando INSERT remoto`)
      }

      // Notificar a listeners
      this.onRegistroUpdatedCallbacks.forEach(cb => cb(registro.id))
    } catch (error) {
      console.error('❌ Error al manejar INSERT remoto:', error)
    }
  }

  /**
   * Manejar UPDATE remoto desde Supabase
   * Supabase gana si tiene más información (peso_salida, folio, etc.)
   */
  private async handleRemoteUpdate(newData: any, oldData: any): Promise<void> {
    try {
      const localRegistro = await window.electron.db.get(
        'SELECT * FROM registros WHERE id = ?',
        [newData.id]
      )

      if (!localRegistro) {
        // No existe localmente - insertar
        console.log(`📥 Insertando registro remoto actualizado ${newData.id}`)
        await this.insertLocalFromRemote(newData)
        return
      }

      // Aplicar merge inteligente: Supabase gana en campos críticos
      const shouldUpdate = this.shouldUpdateFromRemote(localRegistro, newData)

      if (shouldUpdate) {
        console.log(`🔄 Actualizando registro local ${newData.id} con datos remotos`)
        await this.updateLocalFromRemote(newData, localRegistro)
      } else {
        console.log(`⏭️ Registro local ${newData.id} está más actualizado - ignorando UPDATE remoto`)
      }

      // Notificar a listeners
      this.onRegistroUpdatedCallbacks.forEach(cb => cb(newData.id))
    } catch (error) {
      console.error('❌ Error al manejar UPDATE remoto:', error)
    }
  }

  /**
   * Manejar DELETE remoto desde Supabase
   */
  private async handleRemoteDelete(registro: any): Promise<void> {
    try {
      console.log(`🗑️ Eliminando registro local ${registro.id}`)
      await window.electron.db.run('DELETE FROM registros WHERE id = ?', [registro.id])

      // Notificar a listeners
      this.onRegistroUpdatedCallbacks.forEach(cb => cb(registro.id))
    } catch (error) {
      console.error('❌ Error al manejar DELETE remoto:', error)
    }
  }

  /**
   * Determinar si se debe actualizar local con datos remotos
   *
   * Reglas:
   * 1. Si remoto tiene folio y local no → actualizar
   * 2. Si remoto tiene peso_salida y local no → actualizar
   * 3. Si remoto.updated_at > local.updated_at → actualizar
   * 4. Si local tiene sincronizado=0 y remoto tiene sincronizado=1 → actualizar
   */
  private shouldUpdateFromRemote(local: any, remote: any): boolean {
    // Regla 1: Remoto tiene folio y local no
    if (remote.folio && !local.folio) {
      console.log(`  → Remoto tiene folio (${remote.folio}), local no`)
      return true
    }

    // Regla 2: Remoto tiene peso_salida y local no
    if (remote.peso_salida && !local.peso_salida) {
      console.log(`  → Remoto tiene peso_salida, local no`)
      return true
    }

    // Regla 3: Comparar updated_at
    const localUpdated = new Date(local.updated_at).getTime()
    const remoteUpdated = new Date(remote.updated_at).getTime()

    if (remoteUpdated > localUpdated) {
      console.log(`  → Remoto más reciente (${remote.updated_at} > ${local.updated_at})`)
      return true
    }

    // Regla 4: Local no sincronizado pero remoto sí
    if (!local.sincronizado && remote.sincronizado) {
      console.log(`  → Remoto está sincronizado, local no`)
      return true
    }

    return false
  }

  /**
   * Insertar registro en SQLite local desde Supabase
   */
  private async insertLocalFromRemote(remote: any): Promise<void> {
    const query = `
      INSERT OR REPLACE INTO registros (
        id, folio, clave_ruta, ruta, placa_vehiculo, numero_economico,
        clave_operador, operador, clave_empresa, clave_concepto, concepto_id,
        peso_entrada, peso_salida, fecha_entrada, fecha_salida, tipo_pesaje, observaciones,
        sincronizado, fecha_registro, created_at, updated_at, registrado_por
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    await window.electron.db.run(query, [
      remote.id,
      remote.folio,
      remote.clave_ruta,
      remote.ruta,
      remote.placa_vehiculo,
      remote.numero_economico,
      remote.clave_operador,
      remote.operador,
      remote.clave_empresa,
      remote.clave_concepto,
      remote.concepto_id,
      remote.peso_entrada,
      remote.peso_salida,
      remote.fecha_entrada,
      remote.fecha_salida,
      remote.tipo_pesaje,
      remote.observaciones,
      1, // sincronizado = true (viene de Supabase)
      remote.fecha_registro,
      remote.created_at,
      remote.updated_at,
      remote.registrado_por
    ])
  }

  /**
   * Actualizar registro local con merge inteligente
   * Solo actualiza campos que Supabase tiene y local no
   */
  private async updateLocalFromRemote(remote: any, local: any): Promise<void> {
    const updates: string[] = []
    const params: any[] = []

    // Actualizar folio si remoto lo tiene y local no
    if (remote.folio && !local.folio) {
      updates.push('folio = ?')
      params.push(remote.folio)
    }

    // Actualizar peso_salida si remoto lo tiene y local no
    if (remote.peso_salida && !local.peso_salida) {
      updates.push('peso_salida = ?')
      params.push(remote.peso_salida)
    }

    // Actualizar fecha_salida si remoto lo tiene y local no
    if (remote.fecha_salida && !local.fecha_salida) {
      updates.push('fecha_salida = ?')
      params.push(remote.fecha_salida)
    }

    // Actualizar tipo_pesaje si cambió
    if (remote.tipo_pesaje !== local.tipo_pesaje) {
      updates.push('tipo_pesaje = ?')
      params.push(remote.tipo_pesaje)
    }

    // Siempre actualizar updated_at y marcar como sincronizado
    updates.push('updated_at = ?', 'sincronizado = 1')
    params.push(remote.updated_at)

    if (updates.length > 0) {
      const query = `UPDATE registros SET ${updates.join(', ')} WHERE id = ?`
      params.push(remote.id)

      await window.electron.db.run(query, params)
      console.log(`✅ Actualizado registro ${remote.id} con ${updates.length} campos`)
    }
  }

  /**
   * Configurar listener de conectividad
   * Sincroniza pendientes cuando se detecta conexión
   */
  private setupNetworkListener(): void {
    let wasOffline = false

    setInterval(async () => {
      const isOnline = await this.networkService.isOnline()

      if (isOnline && wasOffline) {
        console.log('🌐 Conexión detectada - Sincronizando pendientes...')

        // Sincronizar registros pendientes
        await this.syncService.syncNow()

        // Sincronizar secuencias de folios
        await this.folioService.syncSequences()

        wasOffline = false
      } else if (!isOnline && !wasOffline) {
        console.log('📴 Sin conexión - Modo offline')
        wasOffline = true
      }
    }, 5000) // Verificar cada 5 segundos
  }

  /**
   * Registrar callback para cambios en registros
   */
  onRegistroUpdated(callback: (registroId: string) => void): void {
    this.onRegistroUpdatedCallbacks.push(callback)
  }

  /**
   * Registrar callback para cambios en folios
   */
  onFolioUpdated(callback: (claveEmpresa: number, ultimoNumero: number) => void): void {
    this.onFolioUpdatedCallbacks.push(callback)
  }

  /**
   * Verificar si está suscrito a Realtime
   */
  isRealtimeActive(): boolean {
    return this.isSubscribed
  }
}
