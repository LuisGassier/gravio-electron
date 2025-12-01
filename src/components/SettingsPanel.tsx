import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Save, RefreshCw } from 'lucide-react'

type SerialPort = {
  path: string
  manufacturer?: string
  serialNumber?: string
  vendorId?: string
  productId?: string
}

type Printer = {
  name: string
  displayName: string
}

type AppSettings = {
  serialPort: string
  baudRate: number
  printerName: string
}

export function SettingsPanel() {
  const [availablePorts, setAvailablePorts] = useState<SerialPort[]>([])
  const [availablePrinters, setAvailablePrinters] = useState<Printer[]>([])
  const [settings, setSettings] = useState<AppSettings>({
    serialPort: '',
    baudRate: 2400,
    printerName: '',
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [manualPortEntry, setManualPortEntry] = useState(false)

  // Cargar configuración guardada
  useEffect(() => {
    loadSettings()
    refreshPorts()
    refreshPrinters()
  }, [])

  const loadSettings = async () => {
    if (!window.electron) return

    const savedPort = await window.electron.storage.get('serialPort')
    const savedBaudRate = await window.electron.storage.get('baudRate')
    const savedPrinter = await window.electron.storage.get('printerName')

    setSettings({
      serialPort: savedPort || '',
      baudRate: savedBaudRate || 2400,
      printerName: savedPrinter || '',
    })
  }

  const refreshPorts = async () => {
    if (!window.electron) return
    
    setLoading(true)
    try {
      const ports = await window.electron.serialPort.list()
      setAvailablePorts(ports)
      console.log('📋 Puertos disponibles:', ports)
    } catch (error) {
      console.error('Error al listar puertos:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshPrinters = async () => {
    if (!window.electron) return
    
    try {
      const printers = await window.electron.printer.list()
      setAvailablePrinters(printers)
      console.log('🖨️ Impresoras disponibles:', printers)
    } catch (error) {
      console.error('Error al listar impresoras:', error)
    }
  }

  const saveSettings = async () => {
    if (!window.electron) return

    try {
      await window.electron.storage.set('serialPort', settings.serialPort)
      await window.electron.storage.set('baudRate', settings.baudRate)
      await window.electron.storage.set('printerName', settings.printerName)
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      
      console.log('✅ Configuración guardada:', settings)
    } catch (error) {
      console.error('Error al guardar configuración:', error)
    }
  }

  const testConnection = async () => {
    if (!window.electron || !settings.serialPort) return

    setLoading(true)
    try {
      const success = await window.electron.serialPort.open(
        settings.serialPort,
        settings.baudRate
      )
      
      if (success) {
        alert('✅ Conexión exitosa con la báscula')
        await window.electron.serialPort.close()
      } else {
        alert('❌ Error al conectar con la báscula')
      }
    } catch (error) {
      console.error('Error al probar conexión:', error)
      alert('❌ Error al conectar con la báscula')
    } finally {
      setLoading(false)
    }
  }

  const testPrint = async () => {
    if (!window.electron || !settings.printerName) return

    setLoading(true)
    try {
      const success = await window.electron.printer.print({
        type: 'test',
        printerName: settings.printerName,
        content: 'Prueba de impresión'
      })
      
      if (success) {
        console.log('✅ Impresión enviada a la cola')
      } else {
        alert('❌ Error al enviar impresión')
      }
    } catch (error) {
      console.error('Error al probar impresión:', error)
      alert('❌ Error al probar impresión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-6 h-6" />
        <h2 className="text-2xl font-bold">Configuración de Hardware</h2>
      </div>

      {/* Puerto Serial / Báscula */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Puerto Serial (Báscula Mettler Toledo)</CardTitle>
              <CardDescription>
                Selecciona el puerto COM donde está conectada la báscula
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshPorts}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              id="manual-mode"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              checked={manualPortEntry}
              onChange={(e) => setManualPortEntry(e.target.checked)}
            />
            <label htmlFor="manual-mode" className="text-sm font-medium leading-none cursor-pointer">
              Ingresar puerto manualmente (para puertos virtuales)
            </label>
          </div>

          {manualPortEntry ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Puerto COM (Manual):</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md bg-background"
                value={settings.serialPort}
                placeholder="Ej: COM3"
                onChange={(e) => setSettings({ ...settings, serialPort: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Escribe el nombre exacto del puerto (ej. COM1, COM2, /dev/ttyUSB0)
              </p>
            </div>
          ) : availablePorts.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No se detectaron puertos seriales. Conecta la báscula y presiona "Actualizar", o activa la entrada manual.
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Puerto COM:</label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={settings.serialPort}
                onChange={(e) => setSettings({ ...settings, serialPort: e.target.value })}
              >
                <option value="">-- Seleccionar puerto --</option>
                {availablePorts.map((port) => (
                  <option key={port.path} value={port.path}>
                    {port.path} 
                    {port.manufacturer && ` - ${port.manufacturer}`}
                    {port.serialNumber && ` (SN: ${port.serialNumber})`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Velocidad (Baud Rate):</label>
            <select
              className="w-full p-2 border rounded-md bg-background"
              value={settings.baudRate}
              onChange={(e) => setSettings({ ...settings, baudRate: parseInt(e.target.value) })}
            >
              <option value="1200">1200</option>
              <option value="2400">2400</option>
              <option value="4800">4800</option>
              <option value="9600">9600</option>
              <option value="19200">19200</option>
            </select>
          </div>

          {settings.serialPort && (
            <Button onClick={testConnection} disabled={loading} variant="secondary">
              Probar Conexión
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Impresora */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Impresora Térmica</CardTitle>
              <CardDescription>
                Selecciona la impresora para imprimir recibos
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshPrinters}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {availablePrinters.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No se detectaron impresoras. Conecta la impresora y presiona "Actualizar".
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Impresora:</label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={settings.printerName}
                onChange={(e) => setSettings({ ...settings, printerName: e.target.value })}
              >
                <option value="">-- Seleccionar impresora --</option>
                {availablePrinters.map((printer) => (
                  <option key={printer.name} value={printer.name}>
                    {printer.displayName || printer.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {settings.printerName && (
            <Button onClick={testPrint} disabled={loading} variant="secondary">
              Probar Impresión
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} size="lg" disabled={saved}>
          <Save className="w-4 h-4 mr-2" />
          {saved ? '✓ Guardado' : 'Guardar Configuración'}
        </Button>
      </div>

      {/* Info adicional */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-sm space-y-2">
            <p className="font-medium">💡 Notas importantes:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>La configuración se guarda automáticamente en el dispositivo</li>
              <li>Mettler Toledo típicamente usa 2400 baud</li>
              <li>Si no aparecen puertos, verifica que el cable esté conectado</li>
              <li>En Windows, verifica el puerto en "Administrador de dispositivos"</li>
              <li>La impresora debe estar encendida y conectada</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
