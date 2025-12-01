import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Wifi, WifiOff, Database, Truck, Users, Building2 } from 'lucide-react'
import { getSyncStatus, onSyncStatusChange, syncNow } from '@/lib/sync'

export function StatusPanel() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncStatus, setSyncStatus] = useState(getSyncStatus())
  const [stats, setStats] = useState({
    empresas: 0,
    vehiculos: 0,
    operadores: 0,
    pendingSync: 0
  })
  const [isSyncing, setIsSyncing] = useState(false)
  const [version, setVersion] = useState<string>('')
  const [printerCount, setPrinterCount] = useState(0)
  const [scalePort, setScalePort] = useState<string | null>(null)

  useEffect(() => {
    // Online/Offline listeners
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Sync status listener
    const unsubscribe = onSyncStatusChange(setSyncStatus)

    // Get version and hardware info
    if (window.electron) {
      window.electron.getVersion().then(setVersion)
      loadStats()
      
      // Load hardware status
      window.electron.printer.list().then(printers => {
        setPrinterCount(printers.length)
      })
      
      window.electron.serialPort.getPortInfo().then(info => {
        if (info && info.isOpen) {
          setScalePort(info.path)
        } else {
          setScalePort(null)
        }
      })
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      unsubscribe()
    }
  }, [])

  const loadStats = async () => {
    if (!window.electron) return

    try {
      const empresas = await window.electron.db.query('SELECT COUNT(*) as count FROM empresa', [])
      const vehiculos = await window.electron.db.query('SELECT COUNT(*) as count FROM vehiculos', [])
      const operadores = await window.electron.db.query('SELECT COUNT(*) as count FROM operadores', [])
      const pending = await window.electron.db.query('SELECT COUNT(*) as count FROM sync_queue', [])

      setStats({
        empresas: empresas[0]?.count || 0,
        vehiculos: vehiculos[0]?.count || 0,
        operadores: operadores[0]?.count || 0,
        pendingSync: pending[0]?.count || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await syncNow()
      await loadStats()
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const formatLastSync = (lastSyncDate: Date | null) => {
    if (!lastSyncDate) return 'Ahora mismo'
    const timestamp = lastSyncDate.getTime()
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return 'Hace unos segundos'
    const minutes = Math.floor(seconds / 60)
    if (minutes === 1) return 'Hace 1 minuto'
    return `Hace ${minutes} minutos`
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Buenas noches</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSync}
          disabled={isSyncing}
          className="text-primary hover:text-primary hover:bg-primary/10"
        >
          Actualizar
        </Button>
      </div>

      {/* Online Status */}
      <div className="flex items-center gap-2 text-sm">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-success" />
        ) : (
          <WifiOff className="w-4 h-4 text-destructive" />
        )}
        <span className="text-success font-medium">Sistema Online</span>
      </div>

      {/* Version Info */}
      {version && (
        <div className="text-xs text-muted-foreground">
          Turno: Diurno • v{version}
        </div>
      )}

      {/* Update Notice */}
      <Card className="bg-warning/10 border-warning/30 p-3">
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-warning text-xs">!</span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-warning mb-1">Actualización requerida</p>
            <p className="text-xs text-warning/80 mb-2">Versión 1.0.4</p>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs border-warning/30 text-warning hover:bg-warning/10"
            >
              Ver detalles
            </Button>
          </div>
        </div>
      </Card>

      {/* Sync Status */}
      <Card className="bg-card border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-success" />
            <span className="text-sm font-medium text-foreground">Conectado</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
        </div>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Conexión:</span>
            <span className="text-foreground font-medium">En línea</span>
          </div>
          <div className="flex justify-between">
            <span>Latencia:</span>
            <span className="text-foreground font-medium">
              {syncStatus.isSyncing ? 'Sincronizando...' : '94ms'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Última sync:</span>
            <span className="text-foreground font-medium">
              {formatLastSync(syncStatus.lastSync)}
            </span>
          </div>
        </div>
      </Card>

      {/* Debug Serial Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full text-primary border-primary/30 hover:bg-primary/10"
      >
        <RefreshCw className="w-3 h-3 mr-2" />
        Debug Serial
      </Button>

      {/* Hardware Status */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Database className="w-4 h-4" />
          Hardware
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Báscula</span>
            <span className={scalePort ? "text-success" : "text-warning"}>
              {scalePort || 'Desconectada'}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Impresora</span>
            <span className={printerCount > 0 ? "text-success" : "text-warning"}>
              {printerCount} configurada(s)
            </span>
          </div>
        </div>
      </div>

      {/* Data Statistics */}
      <div className="space-y-3">
        <Card className="bg-card border-border p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold text-foreground">{stats.empresas}</p>
            <p className="text-xs text-muted-foreground">Empresas</p>
          </div>
        </Card>

        <Card className="bg-card border-border p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
            <Truck className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold text-foreground">{stats.vehiculos}</p>
            <p className="text-xs text-muted-foreground">Vehículos</p>
          </div>
        </Card>

        <Card className="bg-card border-border p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold text-foreground">{stats.operadores}</p>
            <p className="text-xs text-muted-foreground">Operadores</p>
          </div>
        </Card>
      </div>

      {/* Sync Stats */}
      <div className="pt-2 border-t border-border">
        <h3 className="text-xs font-semibold text-foreground mb-2">Estadísticas de Datos</h3>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vehículos</span>
            <span className="text-foreground font-medium">{stats.vehiculos}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Operadores</span>
            <span className="text-foreground font-medium">{stats.operadores}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Camiones Pendientes</span>
            <span className="text-foreground font-medium">0</span>
          </div>
        </div>
      </div>
    </div>
  )
}
