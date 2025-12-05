import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Scale, AlertCircle, Truck, Route, FileText, X, RefreshCw } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Combobox } from '@/components/ui/combobox'
import { container } from '@/application'
import { toast } from 'sonner'
import { usePesaje } from '@/contexts/PesajeContext'
import { Registro } from '@/domain'
import { PesajeCompletedModal } from './PesajeCompletedModal'

interface Vehiculo {
  id: string
  no_economico: string
  placas: string
  clave_empresa: number
  empresa: string
  prefijo: string
}

interface Operador {
  id: string
  operador: string
  clave_operador: number
  clave_empresa: number
  empresa: string
  prefijo: string
}

interface Ruta {
  id: number
  ruta: string
  clave_ruta: number
  clave_empresa: number
  empresa: string
  prefijo: string
}

interface Concepto {
  id: string
  nombre: string
  clave_concepto: number
  clave_empresa: number
  empresa: string
  prefijo: string
}

export function WeighingPanel() {
  const { selectedRegistro, clearSelection, notifySalidaRegistrada } = usePesaje()
  const [weight, setWeight] = useState<string>('0')
  const [isScaleConnected, setIsScaleConnected] = useState(false)
  const [isSalidaMode, setIsSalidaMode] = useState(false)
  const [currentRegistro, setCurrentRegistro] = useState<Registro | null>(null)
  const prevSelectedRegistroRef = useRef<Registro | null>(null)

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [operadores, setOperadores] = useState<Operador[]>([])
  const [rutas, setRutas] = useState<Ruta[]>([])
  const [conceptos, setConceptos] = useState<Concepto[]>([])

  const [selectedVehiculo, setSelectedVehiculo] = useState('')
  const [selectedOperador, setSelectedOperador] = useState('')
  const [selectedRuta, setSelectedRuta] = useState('')
  const [selectedConcepto, setSelectedConcepto] = useState('')
  const [selectedEmpresa, setSelectedEmpresa] = useState<number | null>(null)
  const [observaciones, setObservaciones] = useState('')

  // Modal de pesaje completado
  const [showCompletedModal, setShowCompletedModal] = useState(false)
  const [completedRegistro, setCompletedRegistro] = useState<Registro | null>(null)
  const [completedEmpresa, setCompletedEmpresa] = useState<string>('')
  const [completedEmpresaClave, setCompletedEmpresaClave] = useState<number>(0)
  const [completedConceptoClave, setCompletedConceptoClave] = useState<number>(0)
  const [completedConceptoNombre, setCompletedConceptoNombre] = useState<string>('')
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    loadFormData()
    checkScaleConnection()

    // Serial port listener
    if (window.electron) {
      window.electron.serialPort.onData((data) => {
        setWeight(data)
        setIsScaleConnected(true)
      })
    }

    // 🔄 Auto-refresh SOLO si la sincronización automática está habilitada
    let refreshInterval: ReturnType<typeof setInterval> | null = null

    const autoSyncEnabled = localStorage.getItem('autoSyncEnabled') === 'true'

    if (autoSyncEnabled) {
      // Sincronización inicial inmediata
      syncDataFromSupabase()

      refreshInterval = setInterval(() => {
        syncDataFromSupabase()
      }, 30000) // 30 segundos

      console.log('🔄 Auto-refresh de catálogos habilitado (cada 30s)')
    } else {
      console.log('📋 Auto-refresh de catálogos deshabilitado (modo manual)')
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [])

  // Manejar selección de registro para salida
  useEffect(() => {
    // Detectar si cambió de un registro a null (deselección intencional)
    const wasSelected = prevSelectedRegistroRef.current !== null
    const isNowNull = selectedRegistro === null
    
    if (selectedRegistro) {
      setIsSalidaMode(true)
      setCurrentRegistro(selectedRegistro)
      
      // Prellenar TODOS los datos del registro
      
      // Primero establecer la empresa (necesario para filtros)
      setSelectedEmpresa(selectedRegistro.claveEmpresa)
      
      // Buscar el vehiculo por placa para obtener su ID
      const vehiculo = vehiculos.find(v => v.placas === selectedRegistro.placaVehiculo)
      if (vehiculo) {
        setSelectedVehiculo(vehiculo.id)
      }
      
      // Buscar operador por clave
      const operador = operadores.find(o => o.clave_operador === selectedRegistro.claveOperador)
      if (operador) {
        setSelectedOperador(`${operador.id}-${operador.clave_empresa}`)
      }
      
      // Buscar ruta por clave
      const ruta = rutas.find(r => r.clave_ruta === selectedRegistro.claveRuta)
      if (ruta) {
        setSelectedRuta(String(ruta.id))
      }
      
      // Buscar concepto por clave y empresa
      const concepto = conceptos.find(c =>
        c.clave_concepto === selectedRegistro.claveConcepto &&
        c.clave_empresa === selectedRegistro.claveEmpresa
      )
      if (concepto) {
        setSelectedConcepto(`${concepto.id}-${concepto.clave_empresa}`)
      }
      
      setObservaciones(selectedRegistro.observaciones || '')
      
      toast.success(`Vehículo seleccionado para salida`, {
        description: `${selectedRegistro.placaVehiculo} - Peso entrada: ${selectedRegistro.pesoEntrada?.toFixed(2)} kg`
      })
    } else if (wasSelected && isNowNull) {
      // Solo limpiar si realmente se deseleccionó (cambió de algo a null)
      setIsSalidaMode(false)
      setCurrentRegistro(null)
      limpiarFormulario()
    }
    
    // Actualizar referencia
    prevSelectedRegistroRef.current = selectedRegistro
  }, [selectedRegistro, vehiculos, operadores, rutas, conceptos])

  const cancelarSalida = () => {
    setIsSalidaMode(false)
    setCurrentRegistro(null)
    clearSelection()
    limpiarFormulario()
  }

  const limpiarFormulario = () => {
    setSelectedVehiculo('')
    setSelectedOperador('')
    setSelectedRuta('')
    setSelectedConcepto('')
    setSelectedEmpresa(null)
    setObservaciones('')
  }

  const checkScaleConnection = () => {
    try {
      const isConnected = container.pesajeService.isBasculaConectada()
      setIsScaleConnected(isConnected)
      
      if (isConnected) {
        // Registrar callback para actualizaciones de peso
        container.pesajeService.onPesoActualizado((peso) => {
          setWeight(peso.toFixed(4))
        })
      }
    } catch (error) {
      console.warn('⚠️ Báscula no disponible:', error)
      setIsScaleConnected(false)
    }
  }

  const syncDataFromSupabase = async () => {
    if (isSyncing) return

    try {
      setIsSyncing(true)

      // 1. Descargar registros actualizados de Supabase (otras PCs)
      const { downloadRegistros } = await import('@/lib/sync')
      await downloadRegistros()

      // 2. Subir registros pendientes a Supabase
      await container.syncService.syncNow()

      // 3. Sincronizar entidades maestras desde Supabase
      const { syncAllEntities } = await import('@/lib/syncEntities')
      const results = await syncAllEntities()

      const totalSynced =
        results.vehiculos.synced +
        results.operadores.synced +
        results.rutas.synced +
        results.conceptos.synced +
        results.empresas.synced

      if (totalSynced > 0) {
        console.log(`✅ Sincronizados ${totalSynced} registros de catálogos`)

        // 4. Recargar datos en los combobox
        await loadFormData()
      }
    } catch (error) {
      console.warn('⚠️ Error en sincronización automática:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleManualSync = async () => {
    if (isSyncing) {
      toast.info('Sincronización en curso...')
      return
    }

    toast.loading('Sincronizando catálogos...', { id: 'sync-toast' })

    try {
      await syncDataFromSupabase()
      toast.success('Catálogos actualizados', { id: 'sync-toast' })
    } catch (error) {
      toast.error('Error al sincronizar', {
        id: 'sync-toast',
        description: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  }

  const loadFormData = async () => {
    if (!window.electron) return

    try {
      // Cargar vehículos con empresa
      const vehiculosData = await window.electron.db.query(
        `SELECT v.*, e.empresa, e.prefijo 
         FROM vehiculos v 
         LEFT JOIN empresa e ON v.clave_empresa = e.clave_empresa 
         ORDER BY v.no_economico`,
        []
      )

      // Cargar operadores con empresa (relación muchos a muchos)
      const operadoresData = await window.electron.db.query(
        `SELECT DISTINCT o.id, o.operador, o.clave_operador, 
                oe.clave_empresa, e.empresa, e.prefijo
         FROM operadores o
         LEFT JOIN operadores_empresas oe ON o.id = oe.operador_id
         LEFT JOIN empresa e ON oe.clave_empresa = e.clave_empresa
         ORDER BY o.operador`,
        []
      )

      // Cargar rutas con empresa
      const rutasData = await window.electron.db.query(
        `SELECT r.*, e.empresa, e.prefijo 
         FROM rutas r 
         LEFT JOIN empresa e ON r.clave_empresa = e.clave_empresa 
         ORDER BY r.ruta`,
        []
      )

      // Cargar conceptos con empresa (relación muchos a muchos)
      const conceptosData = await window.electron.db.query(
        `SELECT DISTINCT c.id, c.nombre, c.clave_concepto, 
                ce.clave_empresa, e.empresa, e.prefijo
         FROM conceptos c
         LEFT JOIN conceptos_empresas ce ON c.id = ce.concepto_id
         LEFT JOIN empresa e ON ce.clave_empresa = e.clave_empresa
         ORDER BY c.nombre`,
        []
      )

      setVehiculos(vehiculosData)
      setOperadores(operadoresData)
      setRutas(rutasData)
      setConceptos(conceptosData)
    } catch (error) {
      console.error('Error loading form data:', error)
    }
  }

  const connectScale = async () => {
    checkScaleConnection()
    
    if (isScaleConnected) {
      toast.success('✅ Báscula ya conectada')
    } else {
      toast.warning('⚠️ Báscula no disponible - usar peso manual')
    }
  }

  // Filtrar por empresa seleccionada
  const filteredVehiculos = selectedEmpresa
    ? vehiculos.filter(v => v.clave_empresa === selectedEmpresa)
    : vehiculos

  // ⚠️ Operadores SIN filtrar - siempre mostrar lista completa
  const filteredOperadores = operadores

  const filteredRutas = selectedEmpresa
    ? rutas.filter(r => r.clave_empresa === selectedEmpresa)
    : rutas

  const filteredConceptos = selectedEmpresa
    ? conceptos.filter(c => c.clave_empresa === selectedEmpresa)
    : conceptos

  // Prepare options for comboboxes con formato mejorado
  const vehiculoOptions = [
    {
      value: 'NUEVO',
      label: 'Nuevo (sin registrar)',
      subtitle: 'Vehículo no registrado',
      clave_empresa: selectedEmpresa || undefined
    },
    ...filteredVehiculos
      .filter(v => v.clave_empresa && v.empresa) // Filtrar los que no tienen empresa
      .map(v => ({
        value: v.id,
        label: `${v.no_economico} - ${v.placas}`,
        subtitle: `${v.empresa} (${v.prefijo || ''})`,
        clave_empresa: v.clave_empresa
      }))
  ]

  const operadorOptions = [
    {
      value: 'NUEVO',
      label: 'Nuevo (sin registrar)',
      subtitle: 'Operador no registrado',
      clave_empresa: selectedEmpresa || undefined
    },
    ...filteredOperadores
      .filter(o => o.clave_empresa && o.empresa) // Filtrar los que no tienen empresa
      .map(o => ({
        value: `${o.id}-${o.clave_empresa}`,
        label: `${o.operador}`,
        subtitle: `${o.empresa} - Clave: ${o.clave_operador}`,
        clave_empresa: o.clave_empresa
      }))
  ]

  const rutaOptions = [
    {
      value: 'NUEVO',
      label: 'Nuevo (sin registrar)',
      subtitle: 'Ruta no registrada',
      clave_empresa: selectedEmpresa || undefined
    },
    ...filteredRutas
      .filter(r => r.clave_empresa && r.empresa) // Filtrar los que no tienen empresa
      .map(r => ({
        value: String(r.id),
        label: `${r.ruta}`,
        subtitle: `${r.empresa} - Clave: ${r.clave_ruta}`,
        clave_empresa: r.clave_empresa
      }))
  ]

  const conceptoOptions = filteredConceptos
    .filter(c => c.clave_empresa) // Solo verificar clave_empresa (empresa puede ser null temporalmente)
    .map(c => ({
      value: `${c.id}-${c.clave_empresa}`,
      label: `${c.nombre}`,
      subtitle: `${c.empresa || c.prefijo || '(Sin empresa)'} - Clave: ${c.clave_concepto || 'N/A'}`,
      clave_empresa: c.clave_empresa
    }))

  const registrarEntrada = async () => {
    if (!isScaleConnected) {
      toast.error('La báscula no está conectada')
      return
    }

    if (!selectedVehiculo) {
      toast.error('Debes seleccionar un vehículo')
      return
    }

    // Parsear IDs compuestos (UUID-empresa)
    const operadorId = selectedOperador && selectedOperador !== 'NUEVO' 
      ? selectedOperador.substring(0, selectedOperador.lastIndexOf('-')) 
      : undefined
    const conceptoId = selectedConcepto && selectedConcepto !== 'NUEVO'
      ? selectedConcepto.substring(0, selectedConcepto.lastIndexOf('-')) 
      : undefined

    // Detectar si es un vehículo personalizado
    const isCustomVehiculo = selectedVehiculo?.startsWith('CUSTOM:')
    const customNumeroEconomico = isCustomVehiculo ? selectedVehiculo.replace('CUSTOM:', '') : null
    
    // Buscar datos completos de las entidades seleccionadas
    const vehiculo = selectedVehiculo === 'NUEVO' || isCustomVehiculo ? null : vehiculos.find(v => v.id === selectedVehiculo)
    const operador = operadorId ? operadores.find(o => o.id === operadorId) : undefined
    const ruta = selectedRuta && selectedRuta !== 'NUEVO' ? rutas.find(r => r.id === Number(selectedRuta)) : undefined
    const concepto = conceptoId ? conceptos.find(c => c.id === conceptoId) : undefined

    // Validar que si no es nuevo ni personalizado, exista el vehículo
    if (selectedVehiculo !== 'NUEVO' && !isCustomVehiculo && !vehiculo) {
      toast.error('No se encontró el vehículo seleccionado')
      return
    }

    // Necesitamos clave_empresa de algún lado para "NUEVO" o valores personalizados
    let claveEmpresaFinal = selectedEmpresa
    if (!claveEmpresaFinal) {
      toast.error('Debes seleccionar una empresa primero (selecciona cualquier otro campo)')
      return
    }

    const result = await container.pesajeService.registrarEntrada({
      placaVehiculo: vehiculo?.placas || customNumeroEconomico || 'NUEVO',
      numeroEconomico: vehiculo?.no_economico || customNumeroEconomico || 'NUEVO',
      claveEmpresa: vehiculo?.clave_empresa || claveEmpresaFinal,
      claveOperador: operador?.clave_operador || 999999, // Clave temporal para "NUEVO"
      operador: selectedOperador === 'NUEVO' ? 'Nuevo' : (operador?.operador || 'Sin operador'),
      claveRuta: ruta?.clave_ruta || 999999, // Clave temporal para "NUEVO"
      ruta: selectedRuta === 'NUEVO' ? 'Nuevo' : (ruta?.ruta || 'Sin ruta'),
      claveConcepto: concepto?.clave_concepto || 999999, // Clave temporal para "NUEVO"
      conceptoId: conceptoId,
      observaciones: observaciones || undefined
    })

    if (result.success) {
      const registro = result.value
      toast.success('Entrada registrada exitosamente', {
        description: `Folio: ${registro?.folio || 'Pendiente'} - ${registro?.placaVehiculo}`
      })
      limpiarFormulario()
    } else {
      toast.error('Error al registrar entrada', {
        description: result.error.message
      })
    }
  }

  const registrarSalida = async () => {
    if (!isScaleConnected) {
      toast.error('La báscula no está conectada')
      return
    }

    if (!currentRegistro) {
      toast.error('No hay registro de entrada seleccionado')
      return
    }

    const result = await container.pesajeService.registrarSalida(
      currentRegistro.placaVehiculo,
      observaciones || undefined
    )

    if (result.success) {
      let registro = result.value
      const pesoNeto = registro.getPesoNeto()

      // Sincronizar y esperar activamente por el folio de Supabase
      try {
        console.log('🔄 Sincronizando con Supabase para obtener folio...')
        const syncResult = await container.syncService.syncNow()

        if (syncResult.success) {
          // Esperar activamente por el folio (máximo 5 segundos)
          const maxAttempts = 10
          let attempts = 0

          while (attempts < maxAttempts) {
            const updatedResult = await container.sqliteRegistroRepository.findById(registro.id!)

            if (updatedResult.success && updatedResult.value && updatedResult.value.folio) {
              // Solo actualizar el folio, NO reemplazar todo el registro
              // para no perder el peso de salida que acabamos de registrar
              const folio = updatedResult.value.folio
              console.log('✅ Folio obtenido de Supabase:', folio)

              // Crear nuevo registro con el folio actualizado pero conservando todos los demás datos
              const registroConFolio = Registro.create({
                ...registro.toObject(),
                folio
              })

              if (registroConFolio.success) {
                registro = registroConFolio.value
              }
              break
            }

            attempts++
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 500))
            }
          }

          if (!registro.folio) {
            console.warn('⚠️ No se pudo obtener folio después de sincronizar')
          }
        }
      } catch (error) {
        console.warn('⚠️ No se pudo sincronizar inmediatamente (modo offline):', error)
      }

      toast.success('Salida registrada exitosamente', {
        description: `Folio: ${registro.folio || 'Pendiente'} - Peso neto: ${pesoNeto ? pesoNeto.toFixed(2) + ' kg' : 'N/A'}`
      })

      // Obtener el nombre de la empresa
      const empresaResult = await window.electron.db.query(
        'SELECT empresa FROM empresa WHERE clave_empresa = ?',
        [registro.claveEmpresa]
      )
      const empresaNombre = empresaResult[0]?.empresa || 'Sin empresa'

      // Obtener el concepto
      const conceptoResult = await window.electron.db.query(
        'SELECT clave_concepto, nombre FROM conceptos WHERE id = ?',
        [registro.conceptoId]
      )
      const conceptoClave = conceptoResult[0]?.clave_concepto || 0
      const conceptoNombre = conceptoResult[0]?.nombre || 'Sin concepto'

      // Verificar si la impresión automática está habilitada
      const autoPrintEnabled = await container.printerService.isAutoPrintEnabled()
      console.log('🖨️ Impresión automática:', autoPrintEnabled)

      if (autoPrintEnabled) {
        // Imprimir automáticamente
        try {
          console.log('🖨️ Imprimiendo automáticamente...')
          const printResult = await container.printerService.printTicket({
            registro,
            empresa: empresaNombre,
            empresaClave: registro.claveEmpresa,
            conceptoClave,
            conceptoNombre
          })

          if (printResult.success) {
            console.log('✅ Ticket impreso exitosamente')
            toast.success('Ticket impreso exitosamente')
          } else {
            console.error('❌ Error al imprimir ticket:', printResult.error)
            toast.warning('Salida registrada pero no se pudo imprimir el ticket', {
              description: printResult.error.message
            })
          }
        } catch (error) {
          console.error('❌ Error al imprimir ticket:', error)
          toast.warning('Salida registrada pero no se pudo imprimir el ticket', {
            description: error instanceof Error ? error.message : 'Error desconocido'
          })
        }
        cancelarSalida()
      } else {
        // Mostrar modal para confirmar impresión
        console.log('📋 Datos del registro para modal:', {
          id: registro.id,
          folio: registro.folio,
          pesoEntrada: registro.pesoEntrada,
          pesoSalida: registro.pesoSalida,
          pesoNeto: registro.getPesoNeto(),
          fechaEntrada: registro.fechaEntrada,
          fechaSalida: registro.fechaSalida
        })
        setCompletedRegistro(registro)
        setCompletedEmpresa(empresaNombre)
        setCompletedEmpresaClave(registro.claveEmpresa)
        setCompletedConceptoClave(conceptoClave)
        setCompletedConceptoNombre(conceptoNombre)
        setShowCompletedModal(true)
        cancelarSalida()
      }

      // Notificar que se registró una salida para actualizar lista de pendientes
      notifySalidaRegistrada()
    } else {
      toast.error('Error al registrar salida', {
        description: result.error.message
      })
    }
  }

  const handlePrintFromModal = async (copies: number) => {
    if (!completedRegistro) return

    try {
      for (let i = 0; i < copies; i++) {
        console.log(`🖨️ Imprimiendo copia ${i + 1} de ${copies}...`)
        const printResult = await container.printerService.printTicket({
          registro: completedRegistro,
          empresa: completedEmpresa,
          empresaClave: completedEmpresaClave,
          conceptoClave: completedConceptoClave,
          conceptoNombre: completedConceptoNombre
        })

        if (!printResult.success) {
          throw printResult.error
        }

        // Pequeño delay entre copias
        if (i < copies - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      toast.success(`✅ ${copies} ticket${copies > 1 ? 's' : ''} impreso${copies > 1 ? 's' : ''} exitosamente`)
      setShowCompletedModal(false)
    } catch (error) {
      console.error('❌ Error al imprimir tickets:', error)
      toast.error('Error al imprimir', {
        description: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  }

  // Handler para actualizar empresa cuando se selecciona un valor
  const handleVehiculoChange = (value: string) => {
    setSelectedVehiculo(value)
    if (!value) {
      // Si se limpia, resetear empresa si no hay otros campos seleccionados
      if (!selectedOperador && !selectedRuta && !selectedConcepto) {
        setSelectedEmpresa(null)
      }
      return
    }
    
    // Si es NUEVO, no hacer validaciones de empresa
    if (value === 'NUEVO') {
      return
    }
    
    const vehiculo = vehiculos.find(v => v.id === value)
    if (vehiculo) {
      const nuevaEmpresa = vehiculo.clave_empresa
      // Solo establecer la empresa si aún no está seleccionada
      if (!selectedEmpresa) {
        setSelectedEmpresa(nuevaEmpresa)
      }
      // NO limpiar otros campos - dejar que el usuario los maneje
    }
  }

  const handleOperadorChange = (value: string) => {
    setSelectedOperador(value)
    if (!value) {
      // Si se limpia operador, no afectar empresa seleccionada
      return
    }
    
    // Si es NUEVO, no hacer nada más
    if (value === 'NUEVO') {
      return
    }
    
    // Operador seleccionado - NO afecta filtros de otros campos
    // Los operadores son independientes de la empresa
  }

  const handleRutaChange = (value: string) => {
    setSelectedRuta(value)
    if (!value) {
      if (!selectedVehiculo && !selectedOperador && !selectedConcepto) {
        setSelectedEmpresa(null)
      }
      return
    }
    
    // Si es NUEVO, no hacer validaciones de empresa
    if (value === 'NUEVO') {
      return
    }
    
    const ruta = rutas.find(r => r.id === Number(value))
    if (ruta) {
      const nuevaEmpresa = ruta.clave_empresa
      // Solo establecer la empresa si aún no está seleccionada
      if (!selectedEmpresa) {
        setSelectedEmpresa(nuevaEmpresa)
      }
      // NO limpiar otros campos - dejar que el usuario los maneje
    }
  }

  const handleConceptoChange = (value: string) => {
    setSelectedConcepto(value)
    if (!value) {
      if (!selectedVehiculo && !selectedOperador && !selectedRuta) {
        setSelectedEmpresa(null)
      }
      return
    }
    // Separar correctamente el UUID de la empresa (el UUID contiene guiones)
    const lastDashIndex = value.lastIndexOf('-')
    const id = value.substring(0, lastDashIndex)
    const empresa = value.substring(lastDashIndex + 1)

    const concepto = conceptos.find(c => c.id === id && c.clave_empresa === Number(empresa))
    if (concepto) {
      const nuevaEmpresa = Number(empresa)
      // Solo establecer la empresa si aún no está seleccionada
      if (!selectedEmpresa) {
        setSelectedEmpresa(nuevaEmpresa)
      }
      // NO limpiar otros campos - dejar que el usuario los maneje
    }
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
            <Scale className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {isSalidaMode ? 'Registro de SALIDA' : 'Registro de Pesaje'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isSalidaMode
                ? `Vehículo: ${currentRegistro?.placaVehiculo}`
                : 'Sistema de báscula industrial'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="default"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="border-primary/30 text-primary hover:bg-primary/10 font-semibold"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Actualizar'}
          </Button>
          {isSalidaMode && (
            <Button
              variant="destructive"
              size="default"
              onClick={cancelarSalida}
              className="bg-destructive hover:bg-destructive/90 font-semibold shadow-lg"
            >
              <X className="w-5 h-5 mr-2" />
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {/* Scale Connection Warning */}
      {!isScaleConnected && (
        <Card className="bg-warning/10 border-warning/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-warning">
                  Estableciendo conexión con báscula... (COM4)
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={connectScale}
                className="border-warning/30 text-warning hover:bg-warning/10"
              >
                Reconectar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Section */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Información del Pesaje
          </CardTitle>
          <CardDescription>Complete los datos del vehículo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Row 1: Vehículo y Ruta */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Vehículo</Label>
              <Combobox
                key={`vehiculo-${selectedEmpresa || 'all'}`}
                options={vehiculoOptions}
                value={selectedVehiculo}
                onValueChange={handleVehiculoChange}
                placeholder="Buscar o escribir número económico..."
                searchPlaceholder="Buscar..."
                emptyText="No se encontraron vehículos"
                icon={<Truck className="w-4 h-4" />}
                showCount={true}
                countLabel="Vehículo"
                allowCustomValue={true}
                customValueLabel="Usar número económico"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Ruta</Label>
              <Combobox
                key={`ruta-${selectedEmpresa || 'all'}`}
                options={rutaOptions}
                value={selectedRuta}
                onValueChange={handleRutaChange}
                placeholder="Buscar ruta..."
                searchPlaceholder="Buscar..."
                emptyText="No se encontraron rutas"
                icon={<Route className="w-4 h-4" />}
                showCount={true}
                countLabel="Ruta"
              />
            </div>
          </div>

          {/* Row 2: Concepto y Operador */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Concepto</Label>
              <Combobox
                key={`concepto-${selectedEmpresa || 'all'}`}
                options={conceptoOptions}
                value={selectedConcepto}
                onValueChange={handleConceptoChange}
                placeholder="Buscar concepto..."
                searchPlaceholder="Buscar..."
                emptyText="No se encontraron conceptos"
                icon={<FileText className="w-4 h-4" />}
                showCount={true}
                countLabel="Concepto"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Operador</Label>
              <Combobox
                key={`operador-${selectedEmpresa || 'all'}`}
                options={operadorOptions}
                value={selectedOperador}
                onValueChange={handleOperadorChange}
                placeholder="Buscar operador..."
                searchPlaceholder="Buscar..."
                emptyText="No se encontraron operadores"
                icon={<FileText className="w-4 h-4" />}
                showCount={true}
                countLabel="Operador"
              />
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones" className="text-sm font-medium">Observaciones</Label>
            <textarea
              id="observaciones"
              placeholder="Observaciones adicionales (opcional)"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full min-h-[80px] px-3 py-2 bg-input border border-border rounded-md text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Weight Display */}
      <Card className="card-elevated border-border">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="status-indicator status-indicator-active"></div>
              <div className="status-indicator status-indicator-active" style={{ animationDelay: '0.2s' }}></div>
              <div className="status-indicator status-indicator-active" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <div className="relative flex items-baseline justify-center">
              <div className="text-7xl font-bold text-foreground mb-2 tracking-tight font-mono">
                {weight}
              </div>
              <div className="ml-3 text-3xl font-bold text-muted-foreground/60">
                kg
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-2 font-medium">
              Peso en tiempo real
            </div>
          </div>

          {/* Scale Status */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {isScaleConnected ? (
              <div className="badge-status badge-success">
                <div className="status-indicator status-indicator-active"></div>
                <span>Báscula conectada y estable</span>
              </div>
            ) : (
              <div className="badge-status badge-error">
                <div className="status-indicator status-indicator-inactive"></div>
                <span>Báscula desconectada</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {isSalidaMode ? (
            <div className="space-y-3">
              {currentRegistro && (
                <div className="bg-muted/30 rounded-lg p-3 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Peso Entrada:</span>
                    <span className="font-bold">{currentRegistro.pesoEntrada?.toFixed(2)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hora Entrada:</span>
                    <span className="font-mono">{currentRegistro.fechaEntrada?.toLocaleTimeString('es-MX')}</span>
                  </div>
                </div>
              )}
              <Button
                onClick={registrarSalida}
                className="w-full h-14 bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={!isScaleConnected}
              >
                <Scale className="w-5 h-5 mr-2" />
                Registrar Salida e Imprimir
              </Button>
            </div>
          ) : (
            <Button
              onClick={registrarEntrada}
              className="w-full h-14 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isScaleConnected || !selectedVehiculo}
            >
              <Scale className="w-5 h-5 mr-2" />
              Registrar Entrada
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Modal de pesaje completado */}
      {completedRegistro && (
        <PesajeCompletedModal
          open={showCompletedModal}
          onClose={() => setShowCompletedModal(false)}
          registro={completedRegistro}
          empresa={completedEmpresa}
          onPrint={handlePrintFromModal}
        />
      )}
    </div>
  )
}
