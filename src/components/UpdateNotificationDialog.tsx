import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, AlertCircle, Calendar, FileDown, Package } from 'lucide-react'
import { AppVersion, formatFileSize, formatReleaseDate, trackDownloadStart } from '@/lib/updater'

interface UpdateNotificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  updateInfo: AppVersion
  currentVersion: string
}

export function UpdateNotificationDialog({
  open,
  onOpenChange,
  updateInfo,
  currentVersion
}: UpdateNotificationDialogProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      
      // Registrar el inicio de la descarga
      await trackDownloadStart(updateInfo.version)
      
      // Abrir el enlace de descarga en el navegador
      if (window.electron) {
        // Si estamos en Electron, usar el método nativo para abrir URL
        window.open(updateInfo.download_url, '_blank')
      } else {
        // Fallback para navegador
        window.open(updateInfo.download_url, '_blank')
      }
      
      // Cerrar el diálogo después de iniciar la descarga
      setTimeout(() => {
        setIsDownloading(false)
        onOpenChange(false)
      }, 1000)
    } catch (error) {
      console.error('Error al iniciar descarga:', error)
      setIsDownloading(false)
    }
  }

  const handleLater = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-2 border-warning">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-warning" />
            </div>
            <div>
              <DialogTitle className="text-xl text-foreground">
                Actualización Requerida
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Nueva versión {updateInfo.version}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Version Info */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Versión actual:</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{currentVersion}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-success" />
                <span className="text-sm text-muted-foreground">Nueva versión:</span>
              </div>
              <span className="text-sm font-semibold text-success">{updateInfo.version}</span>
            </div>
          </div>

          {/* Release Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>Fecha de lanzamiento: {formatReleaseDate(updateInfo.release_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileDown className="w-3.5 h-3.5" />
              <span>Tamaño: {formatFileSize(updateInfo.file_size)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Package className="w-3.5 h-3.5" />
              <span>Archivo: {updateInfo.file_name}</span>
            </div>
          </div>

          {/* Release Notes */}
          {updateInfo.release_notes && (
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-foreground mb-2">
                Notas de la versión
              </h4>
              <DialogDescription className="text-sm text-muted-foreground whitespace-pre-wrap">
                {updateInfo.release_notes}
              </DialogDescription>
            </div>
          )}

          {/* Required Update Warning */}
          {updateInfo.is_required && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-xs text-destructive">
                Esta actualización es obligatoria y contiene correcciones importantes de seguridad.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {!updateInfo.is_required && (
            <Button
              variant="outline"
              onClick={handleLater}
              disabled={isDownloading}
            >
              Más tarde
            </Button>
          )}
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-warning hover:bg-warning/90 text-white"
          >
            {isDownloading ? (
              <>
                <Download className="w-4 h-4 mr-2 animate-bounce" />
                Iniciando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Actualizar ahora
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
