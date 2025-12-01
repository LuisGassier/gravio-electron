import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function Dashboard() {
  const [weight, setWeight] = useState<string>('0.00')
  const [isConnected, setIsConnected] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [version, setVersion] = useState<string>('')

  useEffect(() => {
    // Obtener versión de la app
    if (window.electron) {
      window.electron.getVersion().then(setVersion)
    }

    // Listener de conexión online/offline
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Listener de datos del puerto serial
    if (window.electron) {
      window.electron.serialPort.onData((data) => {
        setWeight(data)
      })
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const connectScale = async () => {
    if (window.electron) {
      // Leer configuración guardada
      const savedPort = await window.electron.storage.get('serialPort')
      const savedBaudRate = await window.electron.storage.get('baudRate')

      if (!savedPort) {
        alert('⚠️ Por favor configura el puerto serial en Configuración')
        return
      }

      const success = await window.electron.serialPort.open(
        savedPort, 
        savedBaudRate || 2400
      )
      setIsConnected(success)
      if (success) {
        alert('✅ Báscula conectada correctamente')
      } else {
        alert('❌ Error al conectar báscula. Verifica el puerto en Configuración.')
      }
    }
  }

  const disconnectScale = async () => {
    if (window.electron) {
      await window.electron.serialPort.close()
      setIsConnected(false)
      setWeight('0.00')
    }
  }

  const readWeight = async () => {
    if (window.electron) {
      const currentWeight = await window.electron.serialPort.read()
      setWeight(currentWeight)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Status Bar */}
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Sistema de gestión de pesaje</p>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
            isOnline ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-sm font-medium">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          {version && (
            <span className="text-sm text-muted-foreground">v{version}</span>
          )}
        </div>
      </div>

        {/* Weight Display */}
        <Card>
          <CardHeader>
            <CardTitle>Peso Actual</CardTitle>
            <CardDescription>Lectura de báscula Mettler Toledo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-6xl font-bold mb-4">{weight} kg</div>
              <div className="flex gap-2 justify-center">
                {!isConnected ? (
                  <Button onClick={connectScale} size="lg">
                    Conectar Báscula (COM2)
                  </Button>
                ) : (
                  <>
                    <Button onClick={readWeight} size="lg">
                      Leer Peso
                    </Button>
                    <Button onClick={disconnectScale} size="lg" variant="outline">
                      Desconectar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Transacciones Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">24</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Peso Total Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12,450 kg</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Pendientes de Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3</div>
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Configuración Serial</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Puerto:</span>
                  <span className="font-medium">COM2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Velocidad:</span>
                  <span className="font-medium">2400 baud</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado:</span>
                  <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
                    {isConnected ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Sincronización</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado:</span>
                  <span className="font-medium">{isOnline ? 'Activa' : 'En espera'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Última sync:</span>
                  <span className="font-medium">Hace 5 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base de datos:</span>
                  <span className="font-medium">SQLite + Supabase</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  )
}
