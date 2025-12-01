import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Printer, CheckCircle } from 'lucide-react'
import type { Registro } from '@/domain'

interface PesajeCompletedModalProps {
  open: boolean
  onClose: () => void
  registro: Registro
  empresa: string
  onPrint: (copies: number) => Promise<void>
}

export function PesajeCompletedModal({
  open,
  onClose,
  registro,
  empresa,
  onPrint
}: PesajeCompletedModalProps) {
  const [copies, setCopies] = useState(1)
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = async () => {
    setIsPrinting(true)
    try {
      await onPrint(copies)
    } finally {
      setIsPrinting(false)
    }
  }

  const pesoNeto = registro.getPesoNeto()

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-success" />
            Pesaje Completado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Folio */}
          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <div className="text-sm text-muted-foreground mb-1">Folio</div>
            <div className="text-3xl font-bold text-primary">
              {registro.folio || 'PENDIENTE'}
            </div>
          </div>

          {/* Información del vehículo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Empresa</div>
              <div className="font-semibold">{empresa}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Placas</div>
              <div className="font-semibold">{registro.placaVehiculo}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">No. Económico</div>
              <div className="font-semibold">{registro.numeroEconomico}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Operador</div>
              <div className="font-semibold">{registro.operador}</div>
            </div>
          </div>

          {/* Pesos */}
          <div className="border rounded-lg p-4">
            <div className="text-sm font-semibold mb-3">Registro de Pesos</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Peso Entrada:</span>
                <span className="font-semibold">
                  {registro.pesoEntrada?.toFixed(2) || '0.00'} kg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Peso Salida:</span>
                <span className="font-semibold">
                  {registro.pesoSalida?.toFixed(2) || '0.00'} kg
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-primary">
                <span className="font-bold">Peso Neto:</span>
                <span className="font-bold text-primary text-lg">
                  {pesoNeto?.toFixed(2) || '0.00'} kg
                </span>
              </div>
            </div>
          </div>

          {/* Número de copias */}
          <div className="space-y-2">
            <Label htmlFor="copies">Número de copias a imprimir</Label>
            <Input
              id="copies"
              type="number"
              min="1"
              max="5"
              value={copies}
              onChange={(e) => setCopies(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))}
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPrinting}
          >
            Cerrar
          </Button>
          <Button
            onClick={handlePrint}
            disabled={isPrinting}
            className="gap-2"
          >
            <Printer className="w-4 h-4" />
            {isPrinting ? 'Imprimiendo...' : `Imprimir ${copies > 1 ? `(${copies} copias)` : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
