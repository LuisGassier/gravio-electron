import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Download, RefreshCw, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface UpdateInfo {
  version: string
  releaseNotes?: string
  releaseDate?: string
}

export function AutoUpdateDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isDownloaded, setIsDownloaded] = useState(false)

  useEffect(() => {
    if (!window.electron) return

    // Escuchar cuando hay una actualización disponible
    const unsubscribeAvailable = window.electron.updater.onUpdateAvailable((info) => {
      console.log('✅ Actualización disponible:', info)
      setUpdateInfo({
        version: info.version,
        releaseNotes: info.releaseNotes,
        releaseDate: info.releaseDate,
      })
      setIsOpen(true)
      toast.info(`Nueva versión ${info.version} disponible`)
    })

    // Escuchar progreso de descarga
    const unsubscribeProgress = window.electron.updater.onDownloadProgress((progress) => {
      setDownloadProgress(Math.round(progress.percent))
    })

    // Escuchar cuando la actualización está descargada
    const unsubscribeDownloaded = window.electron.updater.onUpdateDownloaded((info) => {
      console.log('✅ Actualización descargada:', info)
      setIsDownloading(false)
      setIsDownloaded(true)
      toast.success('Actualización descargada. Reinicia para instalar.')
    })

    return () => {
      unsubscribeAvailable()
      unsubscribeProgress()
      unsubscribeDownloaded()
    }
  }, [])

  const handleDownload = async () => {
    if (!window.electron) return

    try {
      setIsDownloading(true)
      setDownloadProgress(0)
      await window.electron.updater.download()
    } catch (error) {
      console.error('Error al descargar:', error)
      toast.error('Error al descargar actualización')
      setIsDownloading(false)
    }
  }

  const handleInstall = async () => {
    if (!window.electron) return

    try {
      // Reiniciar e instalar
      await window.electron.updater.installAndRestart()
    } catch (error) {
      console.error('Error al instalar:', error)
      toast.error('Error al instalar actualización')
    }
  }

  const handleLater = () => {
    setIsOpen(false)
    toast.info('Puedes actualizar más tarde desde Configuración')
  }

  if (!updateInfo) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Actualización Disponible
          </DialogTitle>
          <DialogDescription>
            Nueva versión {updateInfo.version} de Gravio está disponible
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {updateInfo.releaseNotes && (
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">Novedades:</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {updateInfo.releaseNotes}
              </p>
            </div>
          )}

          {isDownloading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Descargando...</span>
                <span className="font-semibold">{downloadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          )}

          {isDownloaded && (
            <div className="flex items-center gap-2 text-sm text-success bg-success/10 rounded-lg p-3">
              <CheckCircle className="w-4 h-4" />
              <span>Actualización lista para instalar</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {!isDownloaded && !isDownloading && (
            <>
              <Button variant="outline" onClick={handleLater}>
                Más tarde
              </Button>
              <Button onClick={handleDownload} disabled={isDownloading}>
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
            </>
          )}

          {isDownloaded && (
            <>
              <Button variant="outline" onClick={handleLater}>
                Ahora no
              </Button>
              <Button onClick={handleInstall}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Instalar y Reiniciar
              </Button>
            </>
          )}

          {isDownloading && (
            <Button disabled>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Descargando...
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
