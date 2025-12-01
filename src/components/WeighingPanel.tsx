import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Scale, AlertCircle, Truck, User, Route, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SelectOption {
  id: string
  nombre: string
  [key: string]: any
}

export function WeighingPanel() {
  const [weight, setWeight] = useState<string>('0')
  const [isScaleConnected, setIsScaleConnected] = useState(false)
  const [vehiculos, setVehiculos] = useState<SelectOption[]>([])
  const [operadores, setOperadores] = useState<SelectOption[]>([])
  const [rutas, setRutas] = useState<SelectOption[]>([])
  const [conceptos, setConceptos] = useState<SelectOption[]>([])

  const [, setSelectedVehiculo] = useState('')
  const [, setSelectedOperador] = useState('')
  const [selectedRuta, setSelectedRuta] = useState('')
  const [selectedConcepto, setSelectedConcepto] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [searchVehiculo, setSearchVehiculo] = useState('')
  const [searchOperador, setSearchOperador] = useState('')

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

  const filteredVehiculos = vehiculos.filter(v =>
    v.numero_economico?.toLowerCase().includes(searchVehiculo.toLowerCase()) ||
    v.placas?.toLowerCase().includes(searchVehiculo.toLowerCase())
  )

  const filteredOperadores = operadores.filter(o =>
    o.nombre?.toLowerCase().includes(searchOperador.toLowerCase())
  )

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
          <CardTitle className="text-base">Información del Pesaje</CardTitle>
          <CardDescription>Complete los datos del vehículo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Vehiculo */}
          <div className="space-y-2">
            <Label htmlFor="vehiculo" className="text-sm font-medium flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              Vehículo
            </Label>
            <div className="relative">
              <Input
                id="vehiculo"
                placeholder="Buscar por número económico o pl..."
                value={searchVehiculo}
                onChange={(e) => setSearchVehiculo(e.target.value)}
                className="bg-input border-border text-foreground pr-8"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {searchVehiculo && filteredVehiculos.length > 0 && (
              <div className="bg-popover border border-border rounded-md max-h-32 overflow-y-auto">
                {filteredVehiculos.slice(0, 5).map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVehiculo(v.id)
                      setSearchVehiculo(`${v.numero_economico} - ${v.placas}`)
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                  >
                    <div className="font-medium text-foreground">{v.numero_economico}</div>
                    <div className="text-xs text-muted-foreground">{v.placas}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Conductor */}
          <div className="space-y-2">
            <Label htmlFor="conductor" className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Conductor
            </Label>
            <div className="relative">
              <Input
                id="conductor"
                placeholder="Buscar conductor..."
                value={searchOperador}
                onChange={(e) => setSearchOperador(e.target.value)}
                className="bg-input border-border text-foreground pr-8"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {searchOperador && filteredOperadores.length > 0 && (
              <div className="bg-popover border border-border rounded-md max-h-32 overflow-y-auto">
                {filteredOperadores.slice(0, 5).map((o) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      setSelectedOperador(o.id)
                      setSearchOperador(o.nombre)
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                  >
                    <div className="font-medium text-foreground">{o.nombre}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ruta */}
          <div className="space-y-2">
            <Label htmlFor="ruta" className="text-sm font-medium flex items-center gap-2">
              <Route className="w-4 h-4 text-primary" />
              Ruta
            </Label>
            <div className="relative">
              <select
                id="ruta"
                value={selectedRuta}
                onChange={(e) => setSelectedRuta(e.target.value)}
                className="w-full h-10 px-3 bg-input border border-border rounded-md text-foreground text-sm appearance-none pr-8"
              >
                <option value="">Buscar ruta...</option>
                {rutas.map((r) => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Concepto */}
          <div className="space-y-2">
            <Label htmlFor="concepto" className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Concepto
            </Label>
            <div className="relative">
              <select
                id="concepto"
                value={selectedConcepto}
                onChange={(e) => setSelectedConcepto(e.target.value)}
                className="w-full h-10 px-3 bg-input border border-border rounded-md text-foreground text-sm appearance-none pr-8"
              >
                <option value="">Buscar concepto...</option>
                {conceptos.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones" className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Observaciones
            </Label>
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
