import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Scale, AlertCircle, Truck, User, Route, FileText } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Combobox } from '@/components/ui/combobox'

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
  const [weight, setWeight] = useState<string>('0')
  const [isScaleConnected, setIsScaleConnected] = useState(false)
  
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

    // Serial port listener
    if (window.electron) {
      window.electron.serialPort.onData((data) => {
        setWeight(data)
      })
    }
  }, [])

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

      console.log('📦 Datos cargados:')
      console.log('  Conceptos:', conceptosData)
      console.log('  Operadores:', operadoresData)

      setVehiculos(vehiculosData)
      setOperadores(operadoresData)
      setRutas(rutasData)
      setConceptos(conceptosData)
    } catch (error) {
      console.error('Error loading form data:', error)
    }
  }

  const connectScale = async () => {
    if (!window.electron) return

    const savedPort = await window.electron.storage.get('serialPort')
    const savedBaudRate = await window.electron.storage.get('baudRate')

    if (!savedPort) {
      alert('⚠️ Configura el puerto serial en Configuración')
      return
    }

    const success = await window.electron.serialPort.open(savedPort, savedBaudRate || 2400)
    setIsScaleConnected(success)
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

  // Debug logs
  console.log('📊 Estado actual:')
  console.log('  selectedEmpresa:', selectedEmpresa)
  console.log('  Total operadores:', operadores.length)
  console.log('  Operadores filtrados:', filteredOperadores.length)
  console.log('  Total conceptos:', conceptos.length)
  console.log('  Conceptos filtrados:', filteredConceptos.length)



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
    .map(c => {
      const option = {
        value: `${c.id}-${c.clave_empresa}`,
        label: `${c.clave_concepto || ''} ${c.nombre}`.trim(),
        subtitle: c.empresa || c.prefijo || '(Sin empresa)',
        clave_empresa: c.clave_empresa
      }
      console.log('🎯 Concepto option:', option)
      return option
    })

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
        const concId = selectedConcepto.substring(0, lastDashIndex)
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
    console.log('🔍 handleConceptoChange called with value:', value)
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

    console.log('🔍 Concepto ID:', id, 'Empresa:', empresa)
    console.log('🔍 Todos los conceptos:', conceptos)
    console.log('🔍 Buscando concepto con id:', id, 'y clave_empresa:', Number(empresa))
    const concepto = conceptos.find(c => {
      console.log('  Comparando:', c.id, '===', id, '&&', c.clave_empresa, '===', Number(empresa), '→', c.id === id && c.clave_empresa === Number(empresa))
      return c.id === id && c.clave_empresa === Number(empresa)
    })
    console.log('🔍 Concepto encontrado:', concepto)
    if (concepto) {
      const nuevaEmpresa = concepto.clave_empresa
      console.log('🔍 Nueva empresa seleccionada:', nuevaEmpresa)
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
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
          <Scale className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Registro de Pesaje</h2>
          <p className="text-sm text-muted-foreground">Sistema de báscula industrial</p>
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
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-primary/20">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-primary/20">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-primary/20">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
            <div className="text-6xl font-bold text-foreground mb-1 tracking-tight">
              {weight}
            </div>
            <div className="text-lg text-muted-foreground">kilogramos</div>
          </div>

          {/* Scale Status */}
          <div className="flex items-center justify-center gap-2 mb-4 py-2 px-4 bg-muted/30 rounded-md">
            {isScaleConnected ? (
              <>
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <span className="text-sm text-success font-medium">Báscula conectada</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-destructive"></div>
                <span className="text-sm text-destructive font-medium">Báscula no disponible</span>
              </>
            )}
          </div>

          {/* Action Button */}
          <Button
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base"
            disabled={!isScaleConnected}
          >
            Registrar Entrada
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
