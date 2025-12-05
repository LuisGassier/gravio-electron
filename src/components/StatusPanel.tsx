import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Wifi, WifiOff, Database, Truck, Users, Building2, Scale, FileText } from 'lucide-react'
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
    if (!lastSyncDate) return 'Nunca'

    const timestamp = lastSyncDate.getTime()
    const seconds = Math.floor((Date.now() - timestamp) / 1000)

    if (seconds < 10) return 'Ahora mismo'
    if (seconds < 60) return 'Hace unos segundos'

    const minutes = Math.floor(seconds / 60)
    if (minutes === 1) return 'Hace 1 minuto'
    if (minutes < 60) return `Hace ${minutes} minutos`

    const hours = Math.floor(minutes / 60)
    if (hours === 1) return 'Hace 1 hora'
    if (hours < 24) return `Hace ${hours} horas`

    const days = Math.floor(hours / 24)
    if (days === 1) return 'Hace 1 día'
    return `Hace ${days} días`
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 12) return 'Buenos días'
    if (hour >= 12 && hour < 20) return 'Buenas tardes'
    return 'Buenas noches'
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{getGreeting()}</h2>
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
      <Card className={`border ${isOnline ? 'bg-success/5 border-success/30' : 'bg-destructive/5 border-destructive/30'} p-3`}>
        <div className="flex items-center gap-2.5">
          {isOnline ? (
            <Wifi className="w-5 h-5 text-success" />
          ) : (
            <WifiOff className="w-5 h-5 text-destructive" />
          )}
          <div className="flex-1">
            <span className={`text-sm font-semibold ${isOnline ? 'text-success' : 'text-destructive'}`}>
              {isOnline ? 'Sistema Online' : 'Sin Conexión'}
            </span>
            {version && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Versión {version}
              </p>
            )}
          </div>
          <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-success' : 'bg-destructive'} ${isOnline ? 'animate-pulse' : ''}`}></div>
        </div>
      </Card>

      {/* Sync Status */}
      <Card className="card-elevated border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 icon-wrapper bg-success/10">
              <Database className="w-4 h-4 text-success" />
            </div>
            <span className="text-sm font-semibold text-foreground">Base de Datos</span>
          </div>
          <div className="status-indicator status-indicator-active"></div>
        </div>
        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between items-center py-1.5 px-2 bg-muted/30 rounded">
            <span className="text-muted-foreground">Estado:</span>
            <span className="text-foreground font-semibold">En línea</span>
          </div>
          <div className="flex justify-between items-center py-1.5 px-2 bg-muted/30 rounded">
            <span className="text-muted-foreground">Latencia:</span>
            <span className="text-foreground font-semibold">
              {syncStatus.isSyncing ? 'Sincronizando...' : '94ms'}
            </span>
          </div>
          <div className="flex justify-between items-center py-1.5 px-2 bg-muted/30 rounded">
            <span className="text-muted-foreground">Última sync:</span>
            <span className="text-foreground font-semibold">
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
      <Card className="bg-card border-border p-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <Database className="w-4 h-4 text-primary" />
          Hardware Conectado
        </h3>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Báscula</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${scalePort ? 'bg-success' : 'bg-warning'}`}></div>
              <span className={`text-sm font-semibold ${scalePort ? "text-success" : "text-warning"}`}>
                {scalePort || 'Desconectada'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Impresora</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${printerCount > 0 ? 'bg-success' : 'bg-warning'}`}></div>
              <span className={`text-sm font-semibold ${printerCount > 0 ? "text-success" : "text-warning"}`}>
                {printerCount} configurada(s)
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Data Statistics */}
      <div className="space-y-3">
        <Card className="card-elevated p-3.5 flex items-center gap-3 border-blue-500/20">
          <div className="w-11 h-11 icon-wrapper bg-gradient-to-br from-blue-500 to-blue-600">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold text-foreground">{stats.empresas}</p>
            <p className="text-xs font-medium text-muted-foreground">Empresas</p>
          </div>
        </Card>

        <Card className="card-elevated p-3.5 flex items-center gap-3 border-green-500/20">
          <div className="w-11 h-11 icon-wrapper bg-gradient-to-br from-green-500 to-green-600">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold text-foreground">{stats.vehiculos}</p>
            <p className="text-xs font-medium text-muted-foreground">Vehículos</p>
          </div>
        </Card>

        <Card className="card-elevated p-3.5 flex items-center gap-3 border-purple-500/20">
          <div className="w-11 h-11 icon-wrapper bg-gradient-to-br from-purple-500 to-purple-600">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold text-foreground">{stats.operadores}</p>
            <p className="text-xs font-medium text-muted-foreground">Operadores</p>
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
