import { StatusPanel } from './StatusPanel'
import { WeighingPanel } from './WeighingPanel'
import { PendingTrucksPanel } from './PendingTrucksPanel'
import { Card } from '@/components/ui/card'
import { PesajeProvider } from '@/contexts/PesajeContext'

export function Dashboard() {
  return (
    <PesajeProvider>
      <div className="space-y-2">
        <div className="text-xs text-center text-muted-foreground py-1 bg-primary/5 rounded">
          Versión 1.0.6 - Sistema actualizado ✓
        </div>
        <div className="grid grid-cols-[320px_1fr_340px] gap-4 h-[calc(100vh-140px)] overflow-hidden">
      {/* Left Panel - Status and Stats */}
      <Card className="border-primary/40 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-y-auto h-full p-4 scrollbar-thin">
          <StatusPanel />
        </div>
      </Card>

      {/* Center Panel - Weighing Form */}
      <Card className="border-primary/40 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-y-auto h-full p-4 scrollbar-thin">
          <WeighingPanel />
        </div>
      </Card>

      {/* Right Panel - Pending Trucks */}
      <Card className="border-primary/40 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-y-auto h-full p-4 scrollbar-thin">
          <PendingTrucksPanel />
        </div>
      </Card>
        </div>
      </div>
    </PesajeProvider>
  )
}
