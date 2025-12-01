import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Scale, AlertCircle, Truck, User, Route, FileText, X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Combobox } from '@/components/ui/combobox'
import { container } from '@/application'
import { toast } from 'sonner'
import { usePesaje } from '@/contexts/PesajeContext'
import type { Registro } from '@/domain'

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
  const { selectedRegistro, clearSelection } = usePesaje()
  const [weight, setWeight] = useState<string>('0')
  const [isScaleConnected, setIsScaleConnected] = useState(false)
  const [isSalidaMode, setIsSalidaMode] = useState(false)
  const [currentRegistro, setCurrentRegistro] = useState<Registro | null>(null)
  
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
  }, [])

  // Manejar selección de registro para salida
  useEffect(() => {
    if (selectedRegistro) {
      setIsSalidaMode(true)
      setCurrentRegistro(selectedRegistro)
      
      // Prellenar datos del registro
      console.log('📋 Prellenando datos:', selectedRegistro)
      setSelectedVehiculo(selectedRegistro.id || '')
      setObservaciones(selectedRegistro.observaciones || '')
      
      toast.info(`📥 Modo SALIDA: ${selectedRegistro.placaVehiculo}`, {
        description: `Peso entrada: ${selectedRegistro.pesoEntrada?.toFixed(2)} kg`
      })
    }
  }, [selectedRegistro])

  const cancelarSalida = () => {
    setIsSalidaMode(false)
    setCurrentRegistro(null)
    clearSelection()
    limpiarFormulario()
    toast.info('❌ Modo salida cancelado')
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

  const filteredOperadores = selectedEmpresa
    ? operadores.filter(o => o.clave_empresa === selectedEmpresa)
    : operadores

  const filteredRutas = selectedEmpresa
    ? rutas.filter(r => r.clave_empresa === selectedEmpresa)
    : rutas

  const filteredConceptos = selectedEmpresa
    ? conceptos.filter(c => c.clave_empresa === selectedEmpresa)
    : conceptos

  // Prepare options for comboboxes con formato mejorado
  const vehiculoOptions = filteredVehiculos
    .filter(v => v.clave_empresa && v.empresa) // Filtrar los que no tienen empresa
    .map(v => ({
      value: v.id,
      label: `${v.no_economico} ${v.placas} (${v.prefijo || ''})`,
      subtitle: v.empresa,
      clave_empresa: v.clave_empresa
    }))

  const operadorOptions = filteredOperadores
    .filter(o => o.clave_empresa && o.empresa) // Filtrar los que no tienen empresa
    .map(o => ({
      value: `${o.id}-${o.clave_empresa}`,
      label: `${o.clave_operador} ${o.operador}`,
      subtitle: o.empresa,
      clave_empresa: o.clave_empresa
    }))

  const rutaOptions = filteredRutas
    .filter(r => r.clave_empresa && r.empresa) // Filtrar los que no tienen empresa
    .map(r => ({
      value: String(r.id),
      label: `${r.clave_ruta} ${r.ruta}`,
      subtitle: r.empresa,
      clave_empresa: r.clave_empresa
    }))

  const conceptoOptions = filteredConceptos
    .filter(c => c.clave_empresa) // Solo verificar clave_empresa (empresa puede ser null temporalmente)
    .map(c => ({
      value: `${c.id}-${c.clave_empresa}`,
      label: `${c.clave_concepto || ''} ${c.nombre}`.trim(),
      subtitle: c.empresa || c.prefijo || '(Sin empresa)',
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
    const operadorId = selectedOperador ? selectedOperador.substring(0, selectedOperador.lastIndexOf('-')) : undefined
    const conceptoId = selectedConcepto ? selectedConcepto.substring(0, selectedConcepto.lastIndexOf('-')) : undefined

    // Buscar datos completos de las entidades seleccionadas
    const vehiculo = vehiculos.find(v => v.id === selectedVehiculo)
    const operador = operadorId ? operadores.find(o => o.id === operadorId) : undefined
    const ruta = selectedRuta ? rutas.find(r => r.id === Number(selectedRuta)) : undefined
    const concepto = conceptoId ? conceptos.find(c => c.id === conceptoId) : undefined

    if (!vehiculo) {
      toast.error('No se encontró el vehículo seleccionado')
      return
    }

    const result = await container.pesajeService.registrarEntrada({
      placaVehiculo: vehiculo.placas,
      numeroEconomico: vehiculo.no_economico,
      claveEmpresa: vehiculo.clave_empresa,
      claveOperador: operador?.clave_operador || 0,
      operador: operador?.operador || 'Sin operador',
      claveRuta: ruta?.clave_ruta || 0,
      ruta: ruta?.ruta || 'Sin ruta',
      claveConcepto: concepto?.clave_concepto || 0,
      conceptoId: conceptoId,
      observaciones: observaciones || undefined
    })

    if (result.success) {
      const registro = result.value
      toast.success(`Entrada registrada - Folio: ${registro?.folio || 'Generando...'}`)
      limpiarFormulario()
      loadFormData()
    } else {
      toast.error(`Error: ${result.error}`)
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
      const registro = result.value
      const pesoNeto = registro.getPesoNeto()
      toast.success(`✅ Salida registrada - Folio: ${registro.folio}`, {
        description: `Peso neto: ${pesoNeto ? pesoNeto.toFixed(2) + ' kg' : 'N/A'}`
      })
      
      // TODO: Imprimir ticket térmico aquí
      console.log('🖨️ Imprimiendo ticket...', registro)
      
      cancelarSalida()
      loadFormData()
    } else {
      toast.error(`Error: ${result.error}`)
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
    const vehiculo = vehiculos.find(v => v.id === value)
    if (vehiculo) {
      const nuevaEmpresa = vehiculo.clave_empresa
      setSelectedEmpresa(nuevaEmpresa)
      // Limpiar campos que no pertenecen a esta empresa
      if (selectedOperador) {
        const lastDashIndex = selectedOperador.lastIndexOf('-')
        const opEmp = selectedOperador.substring(lastDashIndex + 1)
        if (Number(opEmp) !== nuevaEmpresa) setSelectedOperador('')
      }
      if (selectedRuta) {
        const ruta = rutas.find(r => r.id === Number(selectedRuta))
        if (ruta && ruta.clave_empresa !== nuevaEmpresa) setSelectedRuta('')
      }
      if (selectedConcepto) {
        const lastDashIndex = selectedConcepto.lastIndexOf('-')
        const concEmp = selectedConcepto.substring(lastDashIndex + 1)
        if (Number(concEmp) !== nuevaEmpresa) setSelectedConcepto('')
      }
    }
  }

  const handleOperadorChange = (value: string) => {
    setSelectedOperador(value)
    if (!value) {
      if (!selectedVehiculo && !selectedRuta && !selectedConcepto) {
        setSelectedEmpresa(null)
      }
      return
    }
    // Separar correctamente el UUID de la empresa (el UUID contiene guiones)
    const lastDashIndex = value.lastIndexOf('-')
    const id = value.substring(0, lastDashIndex)
    const empresa = value.substring(lastDashIndex + 1)

    const operador = operadores.find(o => o.id === id && o.clave_empresa === Number(empresa))
    if (operador) {
      const nuevaEmpresa = operador.clave_empresa
      setSelectedEmpresa(nuevaEmpresa)
      // Limpiar campos que no pertenecen a esta empresa
      if (selectedVehiculo) {
        const vehiculo = vehiculos.find(v => v.id === selectedVehiculo)
        if (vehiculo && vehiculo.clave_empresa !== nuevaEmpresa) setSelectedVehiculo('')
      }
      if (selectedRuta) {
        const ruta = rutas.find(r => r.id === Number(selectedRuta))
        if (ruta && ruta.clave_empresa !== nuevaEmpresa) setSelectedRuta('')
      }
      if (selectedConcepto) {
        const lastDashIndex = selectedConcepto.lastIndexOf('-')
        const concEmp = selectedConcepto.substring(lastDashIndex + 1)
        if (Number(concEmp) !== nuevaEmpresa) setSelectedConcepto('')
      }
    }
  }

  const handleRutaChange = (value: string) => {
    setSelectedRuta(value)
    if (!value) {
      if (!selectedVehiculo && !selectedOperador && !selectedConcepto) {
        setSelectedEmpresa(null)
      }
      return
    }
    const ruta = rutas.find(r => r.id === Number(value))
    if (ruta) {
      const nuevaEmpresa = ruta.clave_empresa
      setSelectedEmpresa(nuevaEmpresa)
      // Limpiar campos que no pertenecen a esta empresa
      if (selectedVehiculo) {
        const vehiculo = vehiculos.find(v => v.id === selectedVehiculo)
        if (vehiculo && vehiculo.clave_empresa !== nuevaEmpresa) setSelectedVehiculo('')
      }
      if (selectedOperador) {
        const lastDashIndex = selectedOperador.lastIndexOf('-')
        const opEmp = selectedOperador.substring(lastDashIndex + 1)
        if (Number(opEmp) !== nuevaEmpresa) setSelectedOperador('')
      }
      if (selectedConcepto) {
        const lastDashIndex = selectedConcepto.lastIndexOf('-')
        const concEmp = selectedConcepto.substring(lastDashIndex + 1)
        if (Number(concEmp) !== nuevaEmpresa) setSelectedConcepto('')
      }
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
      const nuevaEmpresa = concepto.clave_empresa
      setSelectedEmpresa(nuevaEmpresa)
      // Limpiar campos que no pertenecen a esta empresa
      if (selectedVehiculo) {
        const vehiculo = vehiculos.find(v => v.id === selectedVehiculo)
        if (vehiculo && vehiculo.clave_empresa !== nuevaEmpresa) setSelectedVehiculo('')
      }
      if (selectedOperador) {
        const lastDashIndex = selectedOperador.lastIndexOf('-')
        const opEmp = selectedOperador.substring(lastDashIndex + 1)
        if (Number(opEmp) !== nuevaEmpresa) setSelectedOperador('')
      }
      if (selectedRuta) {
        const ruta = rutas.find(r => r.id === Number(selectedRuta))
        if (ruta && ruta.clave_empresa !== nuevaEmpresa) setSelectedRuta('')
      }
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
        {isSalidaMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={cancelarSalida}
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <X className="w-4 h-4 mr-1" />
            Cancelar
          </Button>
        )}
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
          {/* Row 1: Concepto y Operador */}
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
                icon={<User className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Row 2: Ruta y Vehículo */}
          <div className="grid grid-cols-2 gap-4">
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
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Vehículo</Label>
              <Combobox
                key={`vehiculo-${selectedEmpresa || 'all'}`}
                options={vehiculoOptions}
                value={selectedVehiculo}
                onValueChange={handleVehiculoChange}
                placeholder="Buscar por número económico o pl..."
                searchPlaceholder="Buscar..."
                emptyText="No se encontraron vehículos"
                icon={<Truck className="w-4 h-4" />}
                showCount={true}
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
            <div className="relative">
              <div className="text-7xl font-bold text-foreground mb-2 tracking-tight font-mono">
                {weight}
              </div>
              <div className="absolute -right-12 top-1/2 -translate-y-1/2 text-3xl font-bold text-muted-foreground/40">
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
    </div>
  )
}
