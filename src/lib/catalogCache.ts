/**
 * Caché en memoria para catálogos (empresas, conceptos, etc.)
 * Evita queries repetitivas a la base de datos
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
}

interface EmpresaCache {
  clave_empresa: number
  empresa: string
}

interface ConceptoCache {
  id: string
  clave_concepto: number
  nombre: string
}

class CatalogCache {
  private empresasCache: Map<number, CacheEntry<EmpresaCache>> = new Map()
  private conceptosCache: Map<string, CacheEntry<ConceptoCache>> = new Map()
  private readonly TTL = 5 * 60 * 1000 // 5 minutos

  /**
   * Obtiene una empresa por clave (con caché)
   */
  async getEmpresa(claveEmpresa: number): Promise<string> {
    // 1. Verificar caché
    const cached = this.empresasCache.get(claveEmpresa)
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      console.log(`📦 Empresa ${claveEmpresa} obtenida de caché`)
      return cached.data.empresa
    }

    // 2. Consultar BD
    try {
      const result = await window.electron.db.query(
        'SELECT empresa FROM empresa WHERE clave_empresa = ?',
        [claveEmpresa]
      )

      if (result && result[0]) {
        const empresaNombre = result[0].empresa

        // 3. Guardar en caché
        this.empresasCache.set(claveEmpresa, {
          data: { clave_empresa: claveEmpresa, empresa: empresaNombre },
          timestamp: Date.now()
        })

        console.log(`💾 Empresa ${claveEmpresa} guardada en caché`)
        return empresaNombre
      }
    } catch (error) {
      console.warn('⚠️ Error al obtener empresa:', error)
    }

    return 'Sin empresa'
  }

  /**
   * Obtiene un concepto por ID (con caché)
   */
  async getConcepto(conceptoId: string): Promise<{ clave: number; nombre: string }> {
    // 1. Verificar caché
    const cached = this.conceptosCache.get(conceptoId)
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      console.log(`📦 Concepto ${conceptoId} obtenido de caché`)
      return { clave: cached.data.clave_concepto, nombre: cached.data.nombre }
    }

    // 2. Consultar BD
    try {
      const result = await window.electron.db.query(
        'SELECT clave_concepto, nombre FROM conceptos WHERE id = ?',
        [conceptoId]
      )

      if (result && result[0]) {
        const conceptoData = {
          id: conceptoId,
          clave_concepto: result[0].clave_concepto || 0,
          nombre: result[0].nombre || 'Sin concepto'
        }

        // 3. Guardar en caché
        this.conceptosCache.set(conceptoId, {
          data: conceptoData,
          timestamp: Date.now()
        })

        console.log(`💾 Concepto ${conceptoId} guardado en caché`)
        return { clave: conceptoData.clave_concepto, nombre: conceptoData.nombre }
      }
    } catch (error) {
      console.warn('⚠️ Error al obtener concepto:', error)
    }

    return { clave: 0, nombre: 'Sin concepto' }
  }

  /**
   * Precarga empresas en caché (útil al inicio de la app)
   */
  async preloadEmpresas(): Promise<void> {
    try {
      const empresas = await window.electron.db.query('SELECT clave_empresa, empresa FROM empresa')

      for (const empresa of empresas) {
        this.empresasCache.set(empresa.clave_empresa, {
          data: empresa,
          timestamp: Date.now()
        })
      }

      console.log(`✅ Precargadas ${empresas.length} empresas en caché`)
    } catch (error) {
      console.warn('⚠️ Error al precargar empresas:', error)
    }
  }

  /**
   * Precarga conceptos en caché (útil al inicio de la app)
   */
  async preloadConceptos(): Promise<void> {
    try {
      const conceptos = await window.electron.db.query('SELECT id, clave_concepto, nombre FROM conceptos WHERE activo = 1')

      for (const concepto of conceptos) {
        this.conceptosCache.set(concepto.id, {
          data: concepto,
          timestamp: Date.now()
        })
      }

      console.log(`✅ Precargados ${conceptos.length} conceptos en caché`)
    } catch (error) {
      console.warn('⚠️ Error al precargar conceptos:', error)
    }
  }

  /**
   * Invalida toda la caché (útil después de sincronizar catálogos)
   */
  invalidateAll(): void {
    this.empresasCache.clear()
    this.conceptosCache.clear()
    console.log('🗑️ Caché de catálogos invalidada')
  }

  /**
   * Invalida empresa específica
   */
  invalidateEmpresa(claveEmpresa: number): void {
    this.empresasCache.delete(claveEmpresa)
    console.log(`🗑️ Empresa ${claveEmpresa} invalidada de caché`)
  }

  /**
   * Invalida concepto específico
   */
  invalidateConcepto(conceptoId: string): void {
    this.conceptosCache.delete(conceptoId)
    console.log(`🗑️ Concepto ${conceptoId} invalidado de caché`)
  }

  /**
   * Obtiene estadísticas del caché
   */
  getStats(): { empresas: number; conceptos: number; size: string } {
    const empresasCount = this.empresasCache.size
    const conceptosCount = this.conceptosCache.size

    // Estimar tamaño aproximado en memoria
    const avgEmpresaSize = 100 // bytes aprox
    const avgConceptoSize = 150 // bytes aprox
    const totalBytes = (empresasCount * avgEmpresaSize) + (conceptosCount * avgConceptoSize)
    const totalKB = (totalBytes / 1024).toFixed(2)

    return {
      empresas: empresasCount,
      conceptos: conceptosCount,
      size: `${totalKB} KB`
    }
  }
}

// Singleton global
export const catalogCache = new CatalogCache()
