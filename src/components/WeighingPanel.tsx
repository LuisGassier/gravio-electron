import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Scale, AlertCircle, Truck, User, Route, FileText } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Combobox } from '@/components/ui/combobox'

interface SelectOption {
  id: string
  nombre: string
  numero_economico?: string
  placas?: string
  [key: string]: any
}

export function WeighingPanel() {
  const [weight, setWeight] = useState<string>('0')
  const [isScaleConnected, setIsScaleConnected] = useState(false)
  const [vehiculos, setVehiculos] = useState<SelectOption[]>([])
  const [operadores, setOperadores] = useState<SelectOption[]>([])
  const [rutas, setRutas] = useState<SelectOption[]>([])
  const [conceptos, setConceptos] = useState<SelectOption[]>([])

  const [selectedVehiculo, setSelectedVehiculo] = useState('')
  const [selectedOperador, setSelectedOperador] = useState('')
  const [selectedRuta, setSelectedRuta] = useState('')
  const [selectedConcepto, setSelectedConcepto] = useState('')
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
      const [vehiculosData, operadoresData, rutasData, conceptosData] = await Promise.all([
        window.electron.db.query('SELECT * FROM vehiculos ORDER BY numero_economico', []),
        window.electron.db.query('SELECT * FROM operadores ORDER BY nombre', []),
        window.electron.db.query('SELECT * FROM rutas ORDER BY nombre', []),
        window.electron.db.query('SELECT * FROM conceptos ORDER BY nombre', [])
      ])

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

  // Prepare options for comboboxes
  const vehiculoOptions = vehiculos.map(v => ({
    value: v.id,
    label: `${v.numero_economico} - ${v.placas}`
  }))

  const operadorOptions = operadores.map(o => ({
    value: o.id,
    label: o.nombre
  }))

  const rutaOptions = rutas.map(r => ({
    value: r.id,
    label: r.nombre
  }))

  const conceptoOptions = conceptos.map(c => ({
    value: c.id,
    label: c.nombre
  }))

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
                options={conceptoOptions}
                value={selectedConcepto}
                onValueChange={setSelectedConcepto}
                placeholder="Buscar concepto..."
                searchPlaceholder="Buscar..."
                emptyText="No se encontraron conceptos"
                icon={<FileText className="w-4 h-4" />}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Conductor</Label>
              <Combobox
                options={operadorOptions}
                value={selectedOperador}
                onValueChange={setSelectedOperador}
                placeholder="Buscar conductor..."
                searchPlaceholder="Buscar..."
                emptyText="No se encontraron conductores"
                icon={<User className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Row 2: Ruta y Vehículo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Ruta</Label>
              <Combobox
                options={rutaOptions}
                value={selectedRuta}
                onValueChange={setSelectedRuta}
                placeholder="Buscar ruta..."
                searchPlaceholder="Buscar..."
                emptyText="No se encontraron rutas"
                icon={<Route className="w-4 h-4" />}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Vehículo</Label>
              <Combobox
                options={vehiculoOptions}
                value={selectedVehiculo}
                onValueChange={setSelectedVehiculo}
                placeholder="Buscar por número económico o pl..."
                searchPlaceholder="Buscar..."
                emptyText="No se encontraron vehículos"
                icon={<Truck className="w-4 h-4" />}
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
