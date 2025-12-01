import { StatusPanel } from './StatusPanel'
import { WeighingPanel } from './WeighingPanel'
import { PendingTrucksPanel } from './PendingTrucksPanel'

export function Dashboard() {
  return (
    <div className="grid grid-cols-[320px_1fr_340px] gap-4 h-[calc(100vh-120px)] overflow-hidden">
      {/* Left Panel - Status and Stats */}
      <div className="overflow-y-auto pr-2 scrollbar-thin">
        <StatusPanel />
      </div>

      {/* Center Panel - Weighing Form */}
      <div className="overflow-y-auto px-2 scrollbar-thin">
        <WeighingPanel />
      </div>

      {/* Right Panel - Pending Trucks */}
      <div className="overflow-y-auto pl-2 scrollbar-thin">
        <PendingTrucksPanel />
      </div>
    </div>
  )
}
