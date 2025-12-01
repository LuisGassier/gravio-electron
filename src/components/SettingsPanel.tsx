import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Printer, Scale, RefreshCw, Save, X } from 'lucide-react'

type SerialPort = {
  path: string
  manufacturer?: string
  serialNumber?: string
  vendorId?: string
  productId?: string
}

type PrinterType = {
  name: string
  displayName: string
}

type AppSettings = {
  serialPort: string
  baudRate: number
  printerName: string
  autoPrint: boolean
}

interface SettingsPanelProps {
  onClose?: () => void
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [availablePorts, setAvailablePorts] = useState<SerialPort[]>([])
  const [availablePrinters, setAvailablePrinters] = useState<PrinterType[]>([])
  const [settings, setSettings] = useState<AppSettings>({
    serialPort: '',
    baudRate: 2400,
    printerName: '',
    autoPrint: true
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
    const savedAutoPrint = await window.electron.storage.get('autoPrint')

    setSettings({
      serialPort: savedPort || '',
      baudRate: savedBaudRate || 2400,
      printerName: savedPrinter || '',
      autoPrint: savedAutoPrint !== undefined ? savedAutoPrint : true
    })
  }

  const refreshPorts = async () => {
    if (!window.electron) return
    
    setLoading(true)
    try {
      const result = await window.electron.serialPort.list()
      if (result.success && result.ports) {
        setAvailablePorts(result.ports)
        console.log('📋 Puertos disponibles:', result.ports)
      } else {
        console.error('Error al listar puertos:', result.error)
        setAvailablePorts([])
      }
    } catch (error) {
      console.error('Error al listar puertos:', error)
      setAvailablePorts([])
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
      await window.electron.storage.set('autoPrint', settings.autoPrint)
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      
      toast.success('Configuración guardada correctamente')
      console.log('✅ Configuración guardada:', settings)
    } catch (error) {
      console.error('Error al guardar configuración:', error)
      toast.error('Error al guardar la configuración')
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
        toast.success('Conexión exitosa con la báscula')
        await window.electron.serialPort.close()
      } else {
        toast.error('Error al conectar con la báscula')
      }
    } catch (error) {
      console.error('Error al probar conexión:', error)
      toast.error('Error al conectar con la báscula')
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
        toast.success('Impresión enviada a la cola')
      } else {
        toast.error('Error al enviar impresión')
      }
    } catch (error) {
      console.error('Error al probar impresión:', error)
      toast.error('Error al probar impresión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <h2 className="text-lg font-semibold">Configuración del Sistema</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Impresora */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-medium">
          <div className="p-2 bg-primary/10 rounded-md text-primary">
            <Printer className="w-5 h-5" />
          </div>
          <h3>Impresora Térmica</h3>
        </div>

        <div className="space-y-4 pl-2">
          <div className="space-y-2">
            <select
              className="w-full p-3 rounded-md bg-secondary/50 border-none focus:ring-2 focus:ring-primary"
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
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-primary">{availablePrinters.length} impresora(s) detectada(s)</span>
              <button 
                onClick={refreshPrinters}
                className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                Refrescar
              </button>
            </div>
          </div>

          {settings.printerName && (
            <Button 
              onClick={testPrint} 
              disabled={loading} 
              className="w-full bg-warning hover:bg-warning/90 text-primary-foreground font-medium"
            >
              <Printer className="w-4 h-4 mr-2" />
              Probar Impresión
            </Button>
          )}

          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-md text-primary">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">Impresión Automática</p>
                <p className="text-xs text-muted-foreground">{settings.autoPrint ? 'Activada' : 'Desactivada'}</p>
              </div>
            </div>
            <Switch 
              checked={settings.autoPrint}
              onCheckedChange={(checked) => setSettings({ ...settings, autoPrint: checked })}
            />
          </div>
        </div>
      </div>

      {/* Báscula */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-medium">
          <div className="p-2 bg-primary/10 rounded-md text-primary">
            <Scale className="w-5 h-5" />
          </div>
          <h3>Configuración de Báscula</h3>
        </div>

        <div className="space-y-4 pl-2">
          <div className="space-y-2">
            {manualPortEntry ? (
              <input
                type="text"
                className="w-full p-3 rounded-md bg-secondary/50 border-none focus:ring-2 focus:ring-primary"
                value={settings.serialPort}
                placeholder="Ej: COM3"
                onChange={(e) => setSettings({ ...settings, serialPort: e.target.value })}
              />
            ) : (
              <select
                className="w-full p-3 rounded-md bg-secondary/50 border-none focus:ring-2 focus:ring-primary"
                value={settings.serialPort}
                onChange={(e) => setSettings({ ...settings, serialPort: e.target.value })}
              >
                <option value="">-- Seleccionar puerto --</option>
                {availablePorts.map((port) => (
                  <option key={port.path} value={port.path}>
                    {port.path} 
                    {port.manufacturer && ` - ${port.manufacturer}`}
                  </option>
                ))}
              </select>
            )}

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="text-primary">{availablePorts.length} puerto(s) detectado(s)</span>
                <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-600 bg-transparent"
                    checked={manualPortEntry}
                    onChange={(e) => setManualPortEntry(e.target.checked)}
                  />
                  Manual
                </label>
              </div>
              <button 
                onClick={refreshPorts}
                className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                Refrescar
              </button>
            </div>
          </div>

          {settings.serialPort && (
            <Button 
              onClick={testConnection} 
              disabled={loading} 
              variant="outline"
              className="w-full border-primary/50 text-primary hover:bg-primary/10"
            >
              Probar Conexión
            </Button>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between pt-4 mt-8 border-t border-border/50">
        <Button variant="outline" className="w-32" onClick={onClose}>
          Cancelar
        </Button>
        <Button 
          onClick={() => {
            saveSettings()
            onClose?.()
          }} 
          disabled={saved}
          className="w-32 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Save className="w-4 h-4 mr-2" />
          {saved ? 'Guardado' : 'Guardar'}
        </Button>
      </div>
    </div>
  )
}
