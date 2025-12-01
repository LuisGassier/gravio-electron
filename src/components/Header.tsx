import { Settings, User, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

interface HeaderProps {
  empresaName?: string
  userName?: string
  onSettingsClick?: () => void
}

export function Header({
  empresaName = 'Organismo Operador de servicio...',
  userName = 'luis',
  onSettingsClick
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

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
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            className="hover:bg-secondary"
          >
            <Settings className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>
      </div>
    </header>
  )
}
