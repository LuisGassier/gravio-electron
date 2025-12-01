import type { Result } from '../../domain/shared/Result'
import { ResultFactory } from '../../domain/shared/Result'
import type { IFolioSequenceRepository } from '../../domain/repositories/IFolioSequenceRepository'
import type { IEmpresaRepository } from '../../domain/repositories/IEmpresaRepository'
import { FolioSequence } from '../../domain/entities/FolioSequence'
import type { NetworkService } from './NetworkService'

/**
 * Servicio de dominio: FolioService
 * 
 * Responsabilidades:
 * 1. Generar folios con estrategia online-first, offline-fallback
 * 2. Inicializar secuencias desde Supabase al arrancar
 * 3. Sincronizar contadores cuando vuelve la conectividad
 * 
 * Flujo de generación (online-first):
 * 1. Verificar conectividad con NetworkService
 * 2. Si online: intentar generar folio consultando Supabase (remoteRepository)
 * 3. Si falla o sin conexión: generar folio offline (localRepository)
 * 
 * Flujo offline:
 * - getNextFolioOffline() consulta folio_sequences en SQLite
 * - Si no existe la empresa, crea contador inicial con prefijo
 * - Incrementa ultimo_numero y marca sincronizado=0
 * - Formatea como PREF-0000001
 * 
 * Flujo online:
 * - getNextFolioOnline() consulta máximo folio en Supabase
 * - Actualiza secuencia local con ese número
 * - Genera siguiente folio y guarda en local
 * - Marca como sincronizado=1
 */
export class FolioService {
  private readonly localRepository: IFolioSequenceRepository
  private readonly remoteRepository: IFolioSequenceRepository
  private readonly empresaRepository: IEmpresaRepository
  private readonly networkService: NetworkService

  constructor(
    localRepository: IFolioSequenceRepository,
    remoteRepository: IFolioSequenceRepository,
    empresaRepository: IEmpresaRepository,
    networkService: NetworkService
  ) {
    this.localRepository = localRepository
    this.remoteRepository = remoteRepository
    this.empresaRepository = empresaRepository
    this.networkService = networkService
  }

  /**
   * Genera el siguiente folio para una empresa
   * 
   * Estrategia online-first con fallback offline:
   * 1. Verificar conectividad
   * 2. Si online: intentar getNextFolioOnline()
   * 3. Si falla o sin conexión: getNextFolioOffline()
   */
  async getNextFolio(claveEmpresa: number): Promise<Result<string>> {
    try {
      // 1. Verificar conectividad
      const isOnline = await this.networkService.isOnline()

      // 2. Si hay conexión, intentar generar folio online
      if (isOnline) {
        console.log(`🌐 Intentando generar folio ONLINE para empresa ${claveEmpresa}...`)
        
        try {
          const onlineResult = await this.getNextFolioOnline(claveEmpresa)
          
          if (onlineResult.success) {
            console.log(`✅ Folio generado ONLINE: ${onlineResult.value}`)
            return onlineResult
          } else {
            console.warn(`⚠️ Error al generar folio online:`, onlineResult.error?.message)
            console.log(`🔄 Fallback a modo OFFLINE...`)
          }
        } catch (error) {
          console.warn(`⚠️ Excepción al generar folio online:`, error)
          console.log(`🔄 Fallback a modo OFFLINE...`)
        }
      } else {
        console.log(`📴 Sin conexión - Generando folio OFFLINE para empresa ${claveEmpresa}`)
      }

      // 3. Fallback a offline (si no hay conexión o si online falló)
      const offlineResult = await this.getNextFolioOffline(claveEmpresa)
      
      if (offlineResult.success) {
        console.log(`✅ Folio generado OFFLINE: ${offlineResult.value}`)
      }
      
      return offlineResult
    } catch (error) {
      console.error(`❌ Error crítico al generar folio:`, error)
      return ResultFactory.fromError(error)
    }
  }

  /**
   * Genera el siguiente folio en modo ONLINE
   * Consulta Supabase para obtener el último folio usado
   */
  private async getNextFolioOnline(claveEmpresa: number): Promise<Result<string>> {
    try {
      // 1. Obtener el máximo número desde Supabase (tabla registros)
      const maxRemoteResult = await this.remoteRepository.getMaxFolioNumberFromRegistros(claveEmpresa)
      if (!maxRemoteResult.success) {
        return ResultFactory.fail(maxRemoteResult.error)
      }

      const maxRemote = maxRemoteResult.value

      // 2. Obtener información de la empresa para el prefijo
      const empresaResult = await this.empresaRepository.findByClave(claveEmpresa)
      if (!empresaResult.success) {
        return ResultFactory.fail(empresaResult.error)
      }

      const empresa = empresaResult.value
      if (!empresa) {
        return ResultFactory.fail(new Error(`Empresa ${claveEmpresa} no encontrada`))
      }

      // 3. Crear o actualizar secuencia local con el número remoto
      const sequenceResult = FolioSequence.create({
        claveEmpresa: empresa.claveEmpresa,
        prefijoEmpresa: empresa.prefijo,
        ultimoNumero: maxRemote,
        sincronizado: true, // Viene de Supabase, está sincronizado
        updatedAt: new Date(),
      })

      if (!sequenceResult.success) {
        return ResultFactory.fail(sequenceResult.error)
      }

      let sequence = sequenceResult.value

      // 4. Incrementar para obtener el siguiente folio
      const nextFolio = sequence.getNextFolio()

      // 5. Guardar secuencia incrementada localmente
      const incrementedResult = sequence.increment()
      if (!incrementedResult.success) {
        return ResultFactory.fail(incrementedResult.error)
      }

      // Marcar como sincronizado porque acabamos de consultar Supabase
      const syncedResult = incrementedResult.value.markAsSynchronized()
      if (!syncedResult.success) {
        return ResultFactory.fail(syncedResult.error)
      }

      const saveResult = await this.localRepository.save(syncedResult.value)
      if (!saveResult.success) {
        return ResultFactory.fail(saveResult.error)
      }

      console.log(`📋 Folio online: ${nextFolio} (remoto: ${maxRemote}, siguiente: ${syncedResult.value.ultimoNumero})`)

      return ResultFactory.ok(nextFolio)
    } catch (error) {
      return ResultFactory.fromError(error)
    }
  }

  /**
   * Genera el siguiente folio en modo OFFLINE
   * Usa solo la base de datos SQLite local
   */
  private async getNextFolioOffline(claveEmpresa: number): Promise<Result<string>> {
    try {
      // 1. Buscar secuencia existente en local
      const existingResult = await this.localRepository.findByClaveEmpresa(claveEmpresa)
      if (!existingResult.success) {
        return ResultFactory.fail(existingResult.error)
      }

      let sequence = existingResult.value

      // 2. Si no existe, crear nueva secuencia
      if (!sequence) {
        const initResult = await this.initializeSequenceForEmpresa(claveEmpresa)
        if (!initResult.success) {
          return ResultFactory.fail(initResult.error)
        }
        sequence = initResult.value
      }

      // 3. Incrementar y obtener folio
      const nextFolio = sequence.getNextFolio()

      // 4. Guardar secuencia incrementada (marcada como NO sincronizada)
      const incrementedResult = sequence.increment()
      if (!incrementedResult.success) {
        return ResultFactory.fail(incrementedResult.error)
      }

      const saveResult = await this.localRepository.save(incrementedResult.value)
      if (!saveResult.success) {
        return ResultFactory.fail(saveResult.error)
      }

      console.log(`📋 Folio offline: ${nextFolio} (local: ${incrementedResult.value.ultimoNumero}, sincronizado: false)`)

      return ResultFactory.ok(nextFolio)
    } catch (error) {
      return ResultFactory.fromError(error)
    }
  }

  /**
   * Inicializa secuencias al arrancar la app
   * Descarga el último folio de cada empresa desde Supabase
   */
  async initializeSequences(): Promise<Result<void>> {
    try {
      console.log('🔄 Inicializando secuencias de folios...')

      // Obtener todas las empresas
      const empresasResult = await this.empresaRepository.findAll()
      if (!empresasResult.success) {
        console.error('❌ Error al obtener empresas:', empresasResult.error?.message)
        return ResultFactory.fail(empresasResult.error)
      }

      const empresas = empresasResult.value

      // Para cada empresa, sincronizar su secuencia
      for (const empresa of empresas) {
        const syncResult = await this.syncSequenceForEmpresa(empresa.claveEmpresa)
        if (!syncResult.success) {
          console.warn(`⚠️ No se pudo sincronizar empresa ${empresa.claveEmpresa}:`, syncResult.error?.message)
          // Continuar con otras empresas
        }
      }

      console.log('✅ Secuencias inicializadas')
      return ResultFactory.ok(undefined)
    } catch (error) {
      console.error('❌ Error al inicializar secuencias:', error)
      return ResultFactory.fromError(error)
    }
  }

  /**
   * Sincroniza todas las secuencias con Supabase
   * Reconcilia números locales vs remotos usando Math.max
   */
  async syncSequences(): Promise<Result<{ synced: number; errors: string[] }>> {
    try {
      console.log('🔄 Sincronizando secuencias con Supabase...')

      let synced = 0
      const errors: string[] = []

      // Obtener todas las secuencias locales
      const sequencesResult = await this.localRepository.findAll()
      if (!sequencesResult.success) {
        return ResultFactory.fail(sequencesResult.error)
      }

      const sequences = sequencesResult.value

      // Sincronizar cada una
      for (const sequence of sequences) {
        const syncResult = await this.syncSequenceForEmpresa(sequence.claveEmpresa)
        
        if (syncResult.success) {
          synced++
        } else {
          errors.push(`Empresa ${sequence.claveEmpresa}: ${syncResult.error?.message}`)
        }
      }

      console.log(`✅ Secuencias sincronizadas: ${synced}/${sequences.length}`)

      return ResultFactory.ok({ synced, errors })
    } catch (error) {
      return ResultFactory.fromError(error)
    }
  }

  /**
   * Sincroniza la secuencia de una empresa específica
   * Obtiene el máximo folio de registros y actualiza el contador local
   */
  private async syncSequenceForEmpresa(claveEmpresa: number): Promise<Result<FolioSequence>> {
    try {
      // 1. Obtener máximo número remoto de registros (desde Supabase)
      const maxRemoteResult = await this.remoteRepository.getMaxFolioNumberFromRegistros(claveEmpresa)
      if (!maxRemoteResult.success) {
        return ResultFactory.fail(maxRemoteResult.error)
      }

      const maxRemote = maxRemoteResult.value

      // 2. Obtener secuencia local
      const localResult = await this.localRepository.findByClaveEmpresa(claveEmpresa)
      if (!localResult.success) {
        return ResultFactory.fail(localResult.error)
      }

      let sequence = localResult.value

      // 3. Si no existe, inicializar
      if (!sequence) {
        const initResult = await this.initializeSequenceForEmpresa(claveEmpresa)
        if (!initResult.success) {
          return ResultFactory.fail(initResult.error)
        }
        sequence = initResult.value
      }

      // 4. Actualizar con el máximo entre local y remoto
      const updatedResult = sequence.updateFromRemote(maxRemote)
      if (!updatedResult.success) {
        return ResultFactory.fail(updatedResult.error)
      }

      // 5. Guardar en local
      const saveResult = await this.localRepository.save(updatedResult.value)
      if (!saveResult.success) {
        return ResultFactory.fail(saveResult.error)
      }

      console.log(
        `✅ Secuencia sincronizada - Empresa: ${claveEmpresa}, Local: ${sequence.ultimoNumero}, Remoto: ${maxRemote}, Final: ${updatedResult.value.ultimoNumero}`
      )

      return ResultFactory.ok(updatedResult.value)
    } catch (error) {
      return ResultFactory.fromError(error)
    }
  }

  /**
   * Inicializa una secuencia para una empresa que no tiene contador local
   * Intenta obtener el último número desde SQLite local primero
   */
  private async initializeSequenceForEmpresa(claveEmpresa: number): Promise<Result<FolioSequence>> {
    try {
      // 1. Obtener información de la empresa
      const empresaResult = await this.empresaRepository.findByClave(claveEmpresa)
      if (!empresaResult.success) {
        return ResultFactory.fail(empresaResult.error)
      }

      const empresa = empresaResult.value
      if (!empresa) {
        return ResultFactory.fail(new Error(`Empresa ${claveEmpresa} no encontrada`))
      }

      // 2. Obtener último folio usado desde SQLite local
      const maxNumberResult = await this.localRepository.getMaxFolioNumberFromRegistros(claveEmpresa)
      if (!maxNumberResult.success) {
        return ResultFactory.fail(maxNumberResult.error)
      }

      const ultimoNumero = maxNumberResult.value

      // 3. Crear secuencia inicial
      const sequenceResult = FolioSequence.create({
        claveEmpresa: empresa.claveEmpresa,
        prefijoEmpresa: empresa.prefijo,
        ultimoNumero,
        sincronizado: false, // No sincronizada hasta que se sincronice con Supabase
        updatedAt: new Date(),
      })

      if (!sequenceResult.success) {
        return ResultFactory.fail(sequenceResult.error)
      }

      // 4. Guardar en local
      const saveResult = await this.localRepository.save(sequenceResult.value)
      if (!saveResult.success) {
        return ResultFactory.fail(saveResult.error)
      }

      console.log(`✅ Secuencia inicializada localmente - Empresa: ${claveEmpresa}, Prefijo: ${empresa.prefijo}, Último: ${ultimoNumero}`)

      return ResultFactory.ok(sequenceResult.value)
    } catch (error) {
      return ResultFactory.fromError(error)
    }
  }

  /**
   * Obtiene el estado actual de la secuencia de una empresa
   * Útil para debugging y UI
   */
  async getSequenceStatus(claveEmpresa: number): Promise<Result<{
    existe: boolean
    ultimoNumero: number
    proximoFolio: string
    sincronizado: boolean
  }>> {
    try {
      const result = await this.localRepository.findByClaveEmpresa(claveEmpresa)
      if (!result.success) {
        return ResultFactory.fail(result.error)
      }

      const sequence = result.value

      if (!sequence) {
        return ResultFactory.ok({
          existe: false,
          ultimoNumero: 0,
          proximoFolio: 'N/A',
          sincronizado: false,
        })
      }

      return ResultFactory.ok({
        existe: true,
        ultimoNumero: sequence.ultimoNumero,
        proximoFolio: sequence.getNextFolio(),
        sincronizado: sequence.sincronizado,
      })
    } catch (error) {
      return ResultFactory.fromError(error)
    }
  }
}
