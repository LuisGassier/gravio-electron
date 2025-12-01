import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Truck, Clock, User, RefreshCw } from 'lucide-react'
import { container } from '@/application'
import type { Registro } from '@/domain'
import { usePesaje } from '@/contexts/PesajeContext'
import { toast } from 'sonner'

export function PendingTrucksPanel() {
  const [pendingTrucks, setPendingTrucks] = useState<Registro[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const { selectRegistroForSalida } = usePesaje()

  const handleSelectTruck = (truck: Registro) => {
    selectRegistroForSalida(truck)
    toast.success(`🚚 Vehículo ${truck.placaVehiculo} seleccionado para salida`)
  }

  useEffect(() => {
    // Cargar inmediatamente
    loadPendingTrucks()

    // Recargar cada 5 segundos
    const interval = setInterval(() => {
      loadPendingTrucks()
    }, 5000)

    // Limpiar intervalo al desmontar
    return () => clearInterval(interval)
  }, [])

  const loadPendingTrucks = async () => {
    if (!window.electron) return

    try {
      const result = await container.sqliteRegistroRepository.findAllPending()
      if (result.success && result.value) {
        console.log(`🚚 Vehículos pendientes: ${result.value.length}`, result.value)
        setPendingTrucks(result.value)
      } else {
        console.error('Error loading pending trucks:', result)
        setPendingTrucks([])
      }
    } catch (error) {
      console.error('Error loading pending trucks:', error)
      setPendingTrucks([])
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      toast.info('🔄 Sincronizando con servidor...')
      const result = await container.syncService.syncNow()
      if (result.success) {
        toast.success('✅ Sincronización completada')
        await loadPendingTrucks()
      } else {
        toast.error(`Error al sincronizar: ${result.error}`)
      }
    } catch (error) {
      toast.error('Error de conexión. Verifique su internet.')
    } finally {
      setIsSyncing(false)
    }
  }

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return 'N/A'
    const date = new Date(timestamp)
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 icon-wrapper bg-gradient-to-br from-success to-success/60">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Vehículos Pendientes</h2>
            <p className="text-xs text-muted-foreground">Control de salida</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
            className="h-9 px-3"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </Button>
          <div className="w-9 h-9 icon-wrapper bg-primary/10 border border-primary/20">
            <span className="text-primary font-bold text-sm">{pendingTrucks.length}</span>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {pendingTrucks.length === 0 ? (
        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/30 shadow-sm">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-base font-semibold text-success mb-1">
                ¡Todos los vehículos han salido!
              </h3>
              <p className="text-sm text-success/80">
                No hay vehículos pendientes de salida
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Subtitle */}
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg border border-border/50">
            <div className="w-2 h-2 rounded-full bg-warning animate-pulse"></div>
            <p className="text-xs font-medium text-muted-foreground">
              {pendingTrucks.length === 1
                ? '1 vehículo esperando salida'
                : `${pendingTrucks.length} vehículos esperando salida`
              }
            </p>
          </div>

          {/* Pending Trucks List */}
          <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 scrollbar-thin">
            {pendingTrucks.map((truck) => (
              <Card
                key={truck.id}
                className="card-elevated border-border hover:border-primary/40 cursor-pointer group transition-all hover:scale-[1.02]"
                onClick={() => handleSelectTruck(truck)}
              >
                <CardContent className="p-3.5">
                  <div className="flex items-start gap-3">
                    {/* Truck Icon */}
                    <div className="w-10 h-10 icon-wrapper bg-gradient-to-br from-primary/10 to-primary/5 flex-shrink-0 group-hover:from-primary/20 group-hover:to-primary/10">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>

                    {/* Truck Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-foreground text-sm">
                          {truck.numeroEconomico || 'N/A'}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap bg-muted/30 px-2 py-1 rounded">
                          <Clock className="w-3 h-3" />
                          {formatTime(truck.fechaEntrada?.getTime())}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Placas:</span>
                          <span className="text-xs text-foreground font-semibold bg-muted/30 px-2 py-0.5 rounded">
                            {truck.placaVehiculo || 'N/A'}
                          </span>
                        </div>
                        {truck.operador && (
                          <p className="text-xs text-muted-foreground">
                            <User className="w-3 h-3 inline mr-1" />
                            <span className="text-foreground font-medium">{truck.operador}</span>
                          </p>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="mt-2.5 badge-status badge-warning">
                        <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse"></div>
                        <span>Pendiente de salida</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
