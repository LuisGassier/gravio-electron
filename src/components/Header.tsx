import { Settings, User, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SettingsPanel } from './SettingsPanel'

interface HeaderProps {
  empresaName?: string
  userName?: string
}

export function Header({
  empresaName = 'Organismo Operador de servicio...',
  userName = 'luis',
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <header className="bg-card border-b border-border px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Logo and Company Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded flex items-center justify-center">
            <span className="text-primary font-bold text-lg">eB</span>
          </div>
          <span className="text-foreground font-medium text-sm">{empresaName}</span>
        </div>

        {/* Right: Time, User, Settings */}
        <div className="flex items-center gap-4">
          {/* Date and Time */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div className="flex flex-col items-end">
              <span className="text-foreground font-medium">{formatTime(currentTime)}</span>
              <span className="text-muted-foreground text-xs">{formatDate(currentTime)}</span>
            </div>
          </div>

          {/* User */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-md">
            <User className="w-4 h-4 text-primary" />
            <span className="text-foreground text-sm font-medium">{userName}</span>
          </div>

          {/* Settings */}
          <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-secondary"
              >
                <Settings className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[450px] p-0 bg-card border-border" align="end" sideOffset={8}>
              <div className="p-4 max-h-[85vh] overflow-y-auto scrollbar-thin">
                <SettingsPanel onClose={() => setIsSettingsOpen(false)} />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  )
}
