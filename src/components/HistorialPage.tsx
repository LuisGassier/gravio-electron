import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Printer, Search, Calendar, ArrowLeft, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { container } from '@/application/DIContainer'
import type { Registro } from '@/domain/entities/Registro'
import { cleanupOldRecords, getDatabaseStats } from '@/lib/cleanupDatabase'

interface HistorialPageProps {
  onNavigate?: (view: string) => void
}

interface RegistroConNombres {
  id: string | undefined
  folio?: string
  placa: string
  claveOperador: number
  nombreOperador: string
  claveRuta: number
  nombreRuta: string
  pesoEntrada: number
  pesoSalida: number
  pesoNeto: number
  fechaEntrada: string
  fechaSalida?: string
  claveConcepto: number
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
  const [cleaning, setCleaning] = useState(false)
  const [dbStats, setDbStats] = useState({ totalRecords: 0, completedRecords: 0, pendingRecords: 0 })

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50) // 50 registros por página

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
          const operador = operadores.find((op: any) => op.claveOperador === r.claveOperador)
          const ruta = rutas.find((rt: any) => rt.claveRuta === r.claveRuta)
          const concepto = conceptos.find((c: any) => c.clave === r.claveConcepto)
          const empresa = empresas.find((emp: any) => emp.claveEmpresa === r.claveEmpresa)

          return {
            id: r.id,
            folio: r.folio,
            placa: r.placaVehiculo,
            claveOperador: r.claveOperador,
            nombreOperador: operador?.operador || 'Desconocido',
            claveRuta: r.claveRuta,
            nombreRuta: ruta?.ruta || 'Desconocida',
            pesoEntrada: r.pesoEntrada || 0,
            pesoSalida: r.pesoSalida || 0,
            pesoNeto: (r.pesoEntrada || 0) - (r.pesoSalida || 0),
            fechaEntrada: r.fechaEntrada?.toISOString() || '',
            fechaSalida: r.fechaSalida?.toISOString(),
            claveConcepto: r.claveConcepto,
            nombreConcepto: concepto?.nombre || 'Desconocido',
            claveEmpresa: r.claveEmpresa,
            nombreEmpresa: empresa?.empresa || 'Desconocida',
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
    loadDatabaseStats()
  }, [])

  const loadDatabaseStats = async () => {
    const stats = await getDatabaseStats()
    setDbStats({
      totalRecords: stats.totalRecords,
      completedRecords: stats.completedRecords,
      pendingRecords: stats.pendingRecords,
    })
  }

  // Filtrar registros por búsqueda
  useEffect(() => {
    if (!searchTerm) {
      setFilteredRegistros(registros)
      setCurrentPage(1) // Reset a página 1 al limpiar búsqueda
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = registros.filter(r =>
      r.folio?.toLowerCase().includes(term) ||
      r.placa.toLowerCase().includes(term) ||
      r.nombreOperador?.toLowerCase().includes(term) ||
      r.claveOperador.toString().includes(term) ||
      r.nombreRuta?.toLowerCase().includes(term) ||
      r.claveRuta.toString().includes(term)
    )
    setFilteredRegistros(filtered)
    setCurrentPage(1) // Reset a página 1 al filtrar
  }, [searchTerm, registros])

  // Calcular registros paginados
  const totalPages = Math.ceil(filteredRegistros.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRegistros = filteredRegistros.slice(startIndex, endIndex)

  const handleCleanup = async () => {
    if (!window.confirm('¿Estás seguro de eliminar los registros antiguos? Se mantendrán solo los registros de hoy y ayer.')) {
      return
    }

    setCleaning(true)
    try {
      const result = await cleanupOldRecords()
      if (result.success) {
        toast.success(`🧹 Limpieza completada`, {
          description: `Se eliminaron ${result.deleted} registros antiguos`
        })
        await loadDatabaseStats()
        await loadHistorial() // Recargar historial
      } else {
        toast.error('Error al limpiar la base de datos')
      }
    } catch (error) {
      toast.error('Error al limpiar la base de datos')
    } finally {
      setCleaning(false)
    }
  }

  const handleViewDetails = (registro: RegistroConNombres) => {
    setSelectedRegistro(registro)
    setIsModalOpen(true)
  }

  const handlePrint = async (registro: RegistroConNombres) => {
    setIsPrinting(true)
    try {
      console.log('🖨️ Imprimiendo ticket para registro:', registro.folio)
      
      // Obtener el registro completo desde el repositorio
      if (!registro.id) {
        toast.error('Registro sin ID')
        return
      }
      const registroResult = await container.sqliteRegistroRepository.findById(registro.id)
      
      if (!registroResult.success || !registroResult.value) {
        toast.error('No se pudo obtener el registro completo')
        return
      }

      const registroCompleto = registroResult.value

      // Usar el servicio de impresión con el formato correcto
      const printResult = await container.printerService.printTicket({
        registro: registroCompleto,
        empresa: registro.nombreEmpresa,
        empresaClave: registro.claveEmpresa,
        conceptoClave: Number(registro.claveConcepto),
        conceptoNombre: registro.nombreConcepto,
      })

      if (printResult.success) {
        console.log('✅ Ticket impreso correctamente')
        toast.success('Ticket impreso correctamente')
      } else {
        console.error('❌ Error al imprimir:', printResult.error)
        toast.error(printResult.error?.message || 'Error al imprimir ticket')
      }
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
          {/* Estadísticas y botón de limpieza */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{dbStats.totalRecords}</p>
                  <p className="text-xs text-muted-foreground">Total Local</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-success/10">
              <CardContent className="pt-4 pb-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">{dbStats.completedRecords}</p>
                  <p className="text-xs text-muted-foreground">Completos</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-warning/10">
              <CardContent className="pt-4 pb-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-warning">{dbStats.pendingRecords}</p>
                  <p className="text-xs text-muted-foreground">Pendientes</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-destructive/10 cursor-pointer hover:bg-destructive/20 transition-colors" onClick={handleCleanup}>
              <CardContent className="pt-4 pb-3">
                <div className="text-center">
                  <Trash2 className={`w-6 h-6 mx-auto mb-1 text-destructive ${cleaning ? 'animate-pulse' : ''}`} />
                  <p className="text-xs font-medium text-destructive">
                    {cleaning ? 'Limpiando...' : 'Limpiar BD'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

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
                    {paginatedRegistros.map((registro) => (
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

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredRegistros.length)} de {filteredRegistros.length} registro(s)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Mostrar páginas alrededor de la actual
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {!totalPages && (
            <div className="text-sm text-muted-foreground text-right">
              Total: {filteredRegistros.length} registro(s)
            </div>
          )}
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
