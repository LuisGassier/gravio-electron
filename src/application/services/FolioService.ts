import type { Result } from '../../domain/shared/Result'
import { ResultFactory } from '../../domain/shared/Result'
import type { IFolioSequenceRepository } from '../../domain/repositories/IFolioSequenceRepository'
import type { IEmpresaRepository } from '../../domain/repositories/IEmpresaRepository'
import { FolioSequence } from '../../domain/entities/FolioSequence'

/**
 * Servicio de dominio: FolioService
 *
 * Responsabilidades:
 * 1. Generar folios con estrategia offline-first (siempre local, atómico)
 * 2. Inicializar secuencias desde Supabase al arrancar (con timeout)
 * 3. Sincronizar contadores en background cuando hay conectividad
 *
 * Flujo de generación (offline-first):
 * - Siempre usa getNextFolioOffline() — operación atómica en SQLite local
 * - No bloquea en red; el folio se genera en <10ms independientemente de la conexión
 *
 * Flujo offline:
 * - getNextFolioOffline() consulta folio_sequences en SQLite
 * - Si no existe la empresa, crea contador inicial con prefijo
 * - Incrementa ultimo_numero y marca sincronizado=0
 * - Formatea como PREF-0000001
 *
 * Sincronización en background:
 * - syncSequences() reconcilia contadores locales vs Supabase (Math.max)
 * - Se llama al arrancar (con timeout 3s) y al reconectar red
 */
export class FolioService {
  private readonly localRepository: IFolioSequenceRepository
  private readonly remoteRepository: IFolioSequenceRepository
  private readonly empresaRepository: IEmpresaRepository

  constructor(
    localRepository: IFolioSequenceRepository,
    remoteRepository: IFolioSequenceRepository,
    empresaRepository: IEmpresaRepository,
  ) {
    this.localRepository = localRepository
    this.remoteRepository = remoteRepository
    this.empresaRepository = empresaRepository
  }

  /**
   * Genera el siguiente folio para una empresa.
   *
   * Estrategia offline-first: siempre genera localmente con operación atómica.
   * La sincronización con Supabase ocurre en background via syncSequences().
   */
  async getNextFolio(claveEmpresa: number): Promise<Result<string>> {
    console.log(`📋 Generando folio LOCAL para empresa ${claveEmpresa}...`)
    return this.getNextFolioOffline(claveEmpresa)
  }

  /**
   * Genera el siguiente folio en modo OFFLINE
   * Usa operación atómica para prevenir condiciones de carrera
   */
  private async getNextFolioOffline(claveEmpresa: number): Promise<Result<string>> {
    try {
      // 1. Obtener información de la empresa para el prefijo
      const empresaResult = await this.empresaRepository.findByClave(claveEmpresa)
      if (!empresaResult.success) {
        return ResultFactory.fail(empresaResult.error)
      }

      const empresa = empresaResult.value
      if (!empresa) {
        return ResultFactory.fail(new Error(`Empresa ${claveEmpresa} no encontrada`))
      }

      // 2. Incrementar atómicamente y obtener siguiente folio
      // Esta operación es atómica: mutex + transacción + incremento
      const result = await this.localRepository.incrementAndGetNext(
        claveEmpresa,
        empresa.prefijo
      )

      if (!result.success) {
        return ResultFactory.fail(result.error)
      }

      const { folio, sequence } = result.value

      console.log(`📋 Folio offline (atómico): ${folio} (ultimo_numero: ${sequence.ultimoNumero})`)

      return ResultFactory.ok(folio)
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
