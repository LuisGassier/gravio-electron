import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Printer, Scale, RefreshCw, Save, X, Download, CheckCircle } from 'lucide-react'
import { container } from '@/application/DIContainer'

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
  dataBits: 5 | 6 | 7 | 8
  stopBits: 1 | 2
  parity: 'none' | 'even' | 'odd' | 'mark' | 'space'
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
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    printerName: '',
    autoPrint: true
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [manualPortEntry, setManualPortEntry] = useState(false)
  
  // Estado de actualización
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [updateDownloaded, setUpdateDownloaded] = useState(false)
  const [updateInfo, setUpdateInfo] = useState<any>(null)
  const [checkingUpdate, setCheckingUpdate] = useState(false)

  // Cargar configuración guardada
  useEffect(() => {
    loadSettings()
    refreshPorts()
    refreshPrinters()
    
    // Suscribirse a eventos de actualización
    if (window.electron) {
      const unsubAvailable = window.electron.updater.onUpdateAvailable((info) => {
        setUpdateAvailable(true)
        setUpdateInfo(info)
      })
      
      const unsubDownloaded = window.electron.updater.onUpdateDownloaded((info) => {
        setUpdateDownloaded(true)
        setUpdateInfo(info)
      })
      
      return () => {
        unsubAvailable()
        unsubDownloaded()
      }
    }
  }, [])

  const loadSettings = async () => {
    if (!window.electron) return

    const savedPort = await window.electron.storage.get('serialPort')
    const savedBaudRate = await window.electron.storage.get('baudRate')
    const savedDataBits = await window.electron.storage.get('dataBits')
    const savedStopBits = await window.electron.storage.get('stopBits')
    const savedParity = await window.electron.storage.get('parity')
    const savedPrinter = await container.printerService.getDefaultPrinter()
    const savedAutoPrint = await container.printerService.isAutoPrintEnabled()

    setSettings({
      serialPort: savedPort || '',
      baudRate: savedBaudRate || 2400,
      dataBits: savedDataBits || 8,
      stopBits: savedStopBits || 1,
      parity: savedParity || 'none',
      printerName: savedPrinter || '',
      autoPrint: savedAutoPrint
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
      // Save serial port settings (solo si tienen valor)
      if (settings.serialPort) {
        await window.electron.storage.set('serialPort', settings.serialPort)
      }
      if (settings.baudRate) {
        await window.electron.storage.set('baudRate', settings.baudRate)
      }
      if (settings.dataBits) {
        await window.electron.storage.set('dataBits', settings.dataBits)
      }
      if (settings.stopBits) {
        await window.electron.storage.set('stopBits', settings.stopBits)
      }
      if (settings.parity) {
        await window.electron.storage.set('parity', settings.parity)
      }

      // Save printer settings using PrinterService
      if (settings.printerName) {
        const printerResult = await container.printerService.setDefaultPrinter(settings.printerName)
        if (!printerResult.success) {
          toast.error(`Error al guardar impresora: ${printerResult.error.message}`)
          return
        }
      }

      const autoPrintResult = await container.printerService.setAutoPrint(settings.autoPrint)
      if (!autoPrintResult.success) {
        toast.error(`Error al guardar configuración de impresión: ${autoPrintResult.error.message}`)
        return
      }

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
      // Crear un ticket de prueba con datos mínimos
      const testData = {
        printerName: settings.printerName,
        folio: 'TEST-001',
        fecha: new Date(),
        empresaClave: '0000',
        empresaNombre: 'Prueba',
        conceptoClave: '000',
        conceptoNombre: 'Prueba',
        vehiculo: { placas: 'TEST-001', numeroEconomico: '001' },
        operadorClave: '000',
        operadorNombre: 'Prueba',
        rutaClave: '000',
        rutaNombre: 'Prueba',
        pesos: { entrada: 1000, salida: 500, neto: 500 },
        usuario: 'Sistema'
      }
      
      const success = await window.electron.printer.print(testData)
      
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

  const checkForUpdates = async () => {
    if (!window.electron) return
    
    setCheckingUpdate(true)
    try {
      await window.electron.updater.check()
      // Si no hay actualización, lo sabremos por los eventos
      setTimeout(() => {
        if (!updateAvailable && !updateDownloaded) {
          toast.success('✅ La aplicación está actualizada')
        }
        setCheckingUpdate(false)
      }, 2000)
    } catch (error) {
      toast.error('Error al buscar actualizaciones')
      setCheckingUpdate(false)
    }
  }

  const installUpdate = async () => {
    if (!window.electron) return
    
    try {
      await window.electron.updater.installAndRestart()
    } catch (error) {
      toast.error('Error al instalar actualización')
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

          {/* Configuración Serial */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Baudios</label>
              <select
                className="w-full p-2.5 rounded-md bg-secondary/50 border-none focus:ring-2 focus:ring-primary text-sm"
                value={settings.baudRate}
                onChange={(e) => setSettings({ ...settings, baudRate: Number(e.target.value) })}
              >
                <option value={1200}>1200</option>
                <option value={2400}>2400</option>
                <option value={4800}>4800</option>
                <option value={9600}>9600</option>
                <option value={19200}>19200</option>
                <option value={38400}>38400</option>
                <option value={57600}>57600</option>
                <option value={115200}>115200</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Data Bits</label>
              <select
                className="w-full p-2.5 rounded-md bg-secondary/50 border-none focus:ring-2 focus:ring-primary text-sm"
                value={settings.dataBits}
                onChange={(e) => setSettings({ ...settings, dataBits: Number(e.target.value) as 5 | 6 | 7 | 8 })}
              >
                <option value={5}>5</option>
                <option value={6}>6</option>
                <option value={7}>7</option>
                <option value={8}>8</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Stop Bits</label>
              <select
                className="w-full p-2.5 rounded-md bg-secondary/50 border-none focus:ring-2 focus:ring-primary text-sm"
                value={settings.stopBits}
                onChange={(e) => setSettings({ ...settings, stopBits: Number(e.target.value) as 1 | 2 })}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Paridad</label>
            <select
              className="w-full p-2.5 rounded-md bg-secondary/50 border-none focus:ring-2 focus:ring-primary text-sm"
              value={settings.parity}
              onChange={(e) => setSettings({ ...settings, parity: e.target.value as 'none' | 'even' | 'odd' | 'mark' | 'space' })}
            >
              <option value="none">Ninguna (N)</option>
              <option value="even">Par (E)</option>
              <option value="odd">Impar (O)</option>
              <option value="mark">Mark (M)</option>
              <option value="space">Space (S)</option>
            </select>
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

      {/* Actualizaciones */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-medium">
          <div className="p-2 bg-primary/10 rounded-md text-primary">
            <Download className="w-5 h-5" />
          </div>
          <h3>Actualizaciones</h3>
        </div>

        <div className="space-y-4 pl-2">
          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-md ${updateDownloaded ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                {updateDownloaded ? <CheckCircle className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              </div>
              <div>
                <p className="font-medium">
                  {updateDownloaded ? 'Actualización lista' : updateAvailable ? 'Descargando...' : 'Versión actual'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {updateInfo ? `v${updateInfo.version}` : `v${import.meta.env.VITE_APP_VERSION || '1.0.0'}`}
                </p>
              </div>
            </div>
            
            {updateDownloaded ? (
              <Button 
                onClick={installUpdate}
                className="bg-success hover:bg-success/90 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Instalar
              </Button>
            ) : (
              <Button 
                onClick={checkForUpdates}
                disabled={checkingUpdate || updateAvailable}
                variant="outline"
                className="border-primary/50 text-primary hover:bg-primary/10"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${checkingUpdate ? 'animate-spin' : ''}`} />
                {checkingUpdate ? 'Buscando...' : updateAvailable ? 'Descargando...' : 'Buscar'}
              </Button>
            )}
          </div>

          {updateInfo?.releaseNotes && (
            <div className="bg-muted/30 rounded-lg p-3">
              <h4 className="font-semibold text-sm mb-2">Novedades:</h4>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                {updateInfo.releaseNotes}
              </p>
            </div>
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
