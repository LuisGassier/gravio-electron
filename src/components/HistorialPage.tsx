import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Printer, Search, Calendar, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { container } from '@/application/DIContainer'
import type { Registro } from '@/domain/entities/Registro'

interface HistorialPageProps {
  onNavigate?: (view: string) => void
}

interface RegistroConNombres {
  id: string
  folio?: string
  placa: string
  claveOperador: string
  nombreOperador: string
  claveRuta: string
  nombreRuta: string
  pesoEntrada: number
  pesoSalida: number
  pesoNeto: number
  fechaEntrada: string
  fechaSalida?: string
  claveConcepto: string
  nombreConcepto: string
  claveEmpresa: number
  nombreEmpresa: string
  observaciones?: string
  sincronizado: boolean
}

export function HistorialPage({ onNavigate }: HistorialPageProps) {
  const [registros, setRegistros] = useState<RegistroConNombres[]>([])
  const [filteredRegistros, setFilteredRegistros] = useState<RegistroConNombres[]>([])
  const [selectedRegistro, setSelectedRegistro] = useState<RegistroConNombres | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isPrinting, setIsPrinting] = useState(false)

  // Cargar registros completados (con entrada y salida)
  const loadHistorial = async () => {
    setIsLoading(true)
    try {
      const result = await container.sqliteRegistroRepository.findAll()
      
      if (result.success && result.value) {
        // Filtrar solo registros completados (con salida)
        const completados = result.value.filter((r: Registro) => r.pesoSalida && r.fechaSalida)
        
        // Ordenar por fecha de salida descendente (más reciente primero)
        const sorted = completados.sort((a: Registro, b: Registro) => {
          const dateA = new Date(a.fechaSalida || 0).getTime()
          const dateB = new Date(b.fechaSalida || 0).getTime()
          return dateB - dateA
        })

        // Obtener catálogos para enriquecer con nombres
        const [operadoresResult, rutasResult, conceptosResult, empresasResult] = await Promise.all([
          container.sqliteOperadorRepository.findAll(),
          container.sqliteRutaRepository.findAll(),
          window.electron.db.all('SELECT * FROM conceptos'),
          container.sqliteEmpresaRepository.findAll(),
        ])

        const operadores = operadoresResult.success ? operadoresResult.value : []
        const rutas = rutasResult.success ? rutasResult.value : []
        const conceptos = conceptosResult || []
        const empresas = empresasResult.success ? empresasResult.value : []

        // Enriquecer registros con nombres
        const registrosConNombres: RegistroConNombres[] = sorted.map((r: Registro) => {
          const operador = operadores.find((op: any) => op.clave === r.claveOperador)
          const ruta = rutas.find((rt: any) => rt.clave === r.claveRuta)
          const concepto = conceptos.find((c: any) => c.clave === r.claveConcepto)
          const empresa = empresas.find((emp: any) => emp.clave === r.claveEmpresa)

          return {
            id: r.id,
            folio: r.folio,
            placa: r.placaVehiculo,
            claveOperador: r.claveOperador,
            nombreOperador: operador?.nombre || 'Desconocido',
            claveRuta: r.claveRuta,
            nombreRuta: ruta?.nombre || 'Desconocida',
            pesoEntrada: r.pesoEntrada || 0,
            pesoSalida: r.pesoSalida || 0,
            pesoNeto: (r.pesoEntrada || 0) - (r.pesoSalida || 0),
            fechaEntrada: r.fechaEntrada?.toISOString() || '',
            fechaSalida: r.fechaSalida?.toISOString(),
            claveConcepto: r.claveConcepto,
            nombreConcepto: concepto?.nombre || 'Desconocido',
            claveEmpresa: r.claveEmpresa,
            nombreEmpresa: empresa?.nombre || 'Desconocida',
            observaciones: r.observaciones,
            sincronizado: r.sincronizado,
          }
        })
        
        setRegistros(registrosConNombres)
        setFilteredRegistros(registrosConNombres)
      } else {
        toast.error('Error al cargar historial')
      }
    } catch (error) {
      console.error('Error loading historial:', error)
      toast.error('Error al cargar historial')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadHistorial()
  }, [])

  // Filtrar registros por búsqueda
  useEffect(() => {
    if (!searchTerm) {
      setFilteredRegistros(registros)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = registros.filter(r => 
      r.folio?.toLowerCase().includes(term) ||
      r.placa.toLowerCase().includes(term) ||
      r.nombreOperador?.toLowerCase().includes(term) ||
      r.claveOperador.toLowerCase().includes(term) ||
      r.nombreRuta?.toLowerCase().includes(term) ||
      r.claveRuta.toLowerCase().includes(term)
    )
    setFilteredRegistros(filtered)
  }, [searchTerm, registros])

  const handleViewDetails = (registro: RegistroConNombres) => {
    setSelectedRegistro(registro)
    setIsModalOpen(true)
  }

  const handlePrint = async (registro: RegistroConNombres) => {
    setIsPrinting(true)
    try {
      // Obtener usuario actual
      const supabaseUser = await window.electron.storage.get('supabase_user')
      const usuario = supabaseUser?.nombre || 'Sistema'

      const fechaSalida = registro.fechaSalida ? new Date(registro.fechaSalida) : new Date(registro.fechaEntrada)
      
      console.log('🖨️ Imprimiendo ticket para registro:', registro.folio)
      
      const printResult = await window.electron.printer.print({
        folio: registro.folio || 'SIN FOLIO',
        fecha: fechaSalida.toLocaleString('es-MX', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        placa: registro.placa,
        operador: registro.claveOperador,
        nombreOperador: registro.nombreOperador,
        ruta: registro.claveRuta,
        nombreRuta: registro.nombreRuta,
        pesoEntrada: registro.pesoEntrada,
        pesoSalida: registro.pesoSalida,
        pesoNeto: registro.pesoNeto,
        concepto: registro.nombreConcepto,
        empresa: registro.nombreEmpresa,
        observaciones: registro.observaciones || '',
        usuario,
      })

      console.log('✅ Resultado de impresión:', printResult)
      toast.success('Ticket impreso correctamente')
    } catch (error) {
      console.error('❌ Error printing:', error)
      toast.error('Error al imprimir ticket')
    } finally {
      setIsPrinting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Historial de Registros
              </CardTitle>
              <CardDescription>
                Consulta y reimprime tickets de registros completados
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => onNavigate?.('dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Regresar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por folio, placa, operador o ruta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabla de registros */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando historial...
            </div>
          ) : filteredRegistros.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No se encontraron registros' : 'No hay registros completados'}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-semibold">Folio</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Fecha Salida</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Vehículo</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Operador</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">P. Entrada</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">P. Salida</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">P. Neto</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistros.map((registro) => (
                      <tr 
                        key={registro.id} 
                        className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => handleViewDetails(registro)}
                      >
                        <td className="px-4 py-3 text-sm font-mono">
                          {registro.folio || <span className="text-muted-foreground">Sin folio</span>}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {registro.fechaSalida ? formatDate(registro.fechaSalida) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">{registro.placa}</td>
                        <td className="px-4 py-3 text-sm">
                          {registro.claveOperador} - {registro.nombreOperador}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-mono">
                          {registro.pesoEntrada.toFixed(2)} kg
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-mono">
                          {registro.pesoSalida?.toFixed(2)} kg
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-mono font-semibold">
                          {registro.pesoNeto.toFixed(2)} kg
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePrint(registro)
                            }}
                            disabled={isPrinting}
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground text-right">
            Total: {filteredRegistros.length} registro(s)
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalles */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Registro</DialogTitle>
          </DialogHeader>
          
          {selectedRegistro && (
            <div className="space-y-6">
              {/* Información General */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">INFORMACIÓN GENERAL</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Folio</Label>
                    <div className="font-mono font-semibold text-lg">
                      {selectedRegistro.folio || 'SIN FOLIO'}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Estado</Label>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="font-medium">Completado</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fechas */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">FECHAS</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Entrada</Label>
                    <div>{formatDate(selectedRegistro.fechaEntrada)}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Salida</Label>
                    <div>
                      {selectedRegistro.fechaSalida ? formatDate(selectedRegistro.fechaSalida) : '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehículo y Personal */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">VEHÍCULO Y PERSONAL</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Vehículo (Placa)</Label>
                    <div className="font-semibold">{selectedRegistro.placa}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Operador</Label>
                    <div>
                      {selectedRegistro.claveOperador} - {selectedRegistro.nombreOperador}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Ruta</Label>
                    <div>
                      {selectedRegistro.claveRuta} - {selectedRegistro.nombreRuta}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pesos */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">PESOS</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-xs text-muted-foreground mb-1">Entrada</div>
                      <div className="text-2xl font-bold font-mono">
                        {selectedRegistro.pesoEntrada.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">kg</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-xs text-muted-foreground mb-1">Salida</div>
                      <div className="text-2xl font-bold font-mono">
                        {selectedRegistro.pesoSalida?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-xs text-muted-foreground">kg</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/10">
                    <CardContent className="pt-6">
                      <div className="text-xs text-muted-foreground mb-1">Neto</div>
                      <div className="text-2xl font-bold font-mono text-primary">
                        {selectedRegistro.pesoNeto.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">kg</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Concepto y Empresa */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">CONCEPTO Y EMPRESA</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Concepto</Label>
                    <div>{selectedRegistro.nombreConcepto || selectedRegistro.claveConcepto}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Empresa</Label>
                    <div>{selectedRegistro.nombreEmpresa || selectedRegistro.claveEmpresa}</div>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              {selectedRegistro.observaciones && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Observaciones</Label>
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    {selectedRegistro.observaciones}
                  </div>
                </div>
              )}

              {/* Botón de impresión */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cerrar
                </Button>
                <Button
                  onClick={() => handlePrint(selectedRegistro)}
                  disabled={isPrinting}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  {isPrinting ? 'Imprimiendo...' : 'Reimprimir Ticket'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
