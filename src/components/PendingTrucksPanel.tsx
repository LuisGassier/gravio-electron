import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Truck } from 'lucide-react'

interface PendingTruck {
  id: string
  numero_economico: string
  placas: string
  operador_nombre?: string
  hora_entrada?: number
}

export function PendingTrucksPanel() {
  const [pendingTrucks, setPendingTrucks] = useState<PendingTruck[]>([])

  useEffect(() => {
    loadPendingTrucks()
  }, [])

  const loadPendingTrucks = async () => {
    if (!window.electron) return

    try {
      // Query for trucks that have entrada but no salida
      const query = `
        SELECT
          r.id,
          v.numero_economico,
          v.placas,
          o.nombre as operador_nombre,
          r.fecha_hora_entrada as hora_entrada
        FROM registros r
        LEFT JOIN vehiculos v ON r.vehiculo_id = v.id
        LEFT JOIN operadores o ON r.operador_id = o.id
        WHERE r.fecha_hora_salida IS NULL
        ORDER BY r.fecha_hora_entrada DESC
      `
      const trucks = await window.electron.db.query(query, [])
      setPendingTrucks(trucks)
    } catch (error) {
      console.error('Error loading pending trucks:', error)
    }
  }

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return 'N/A'
    const date = new Date(timestamp * 1000)
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
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <h2 className="text-lg font-semibold text-foreground">Camiones Pendientes</h2>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-bold text-sm">{pendingTrucks.length}</span>
        </div>
      </div>

      {/* Status Message */}
      {pendingTrucks.length === 0 ? (
        <Card className="bg-success/10 border-success/30">
          <CardContent className="p-6">
            <div className="text-center">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-success mb-1">
                ¡Todos los camiones han salido!
              </h3>
              <p className="text-sm text-success/80">
                No hay vehículos pendientes
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Subtitle */}
          <p className="text-sm text-muted-foreground">
            {pendingTrucks.length === 1
              ? 'Hay 1 vehículo pendiente de salida'
              : `Hay ${pendingTrucks.length} vehículos pendientes de salida`
            }
          </p>

          {/* Pending Trucks List */}
          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
            {pendingTrucks.map((truck) => (
              <Card
                key={truck.id}
                className="bg-card border-border hover:border-primary/50 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Truck Icon */}
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>

                    {/* Truck Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-foreground text-sm">
                          {truck.numero_economico || 'N/A'}
                        </h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTime(truck.hora_entrada)}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Placas: <span className="text-foreground font-medium">{truck.placas || 'N/A'}</span>
                        </p>
                        {truck.operador_nombre && (
                          <p className="text-xs text-muted-foreground">
                            Operador: <span className="text-foreground font-medium">{truck.operador_nombre}</span>
                          </p>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-warning/10 border border-warning/30">
                        <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse"></div>
                        <span className="text-xs font-medium text-warning">Pendiente de salida</span>
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
