import { Settings, User, Clock, Building2, History, LogOut, Sun, Moon, Sunset } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SettingsPanel } from './SettingsPanel'

interface HeaderProps {
  empresaName?: string
  userName?: string
  onLogout?: () => void
  onNavigate?: (view: string) => void
}

export function Header({
  empresaName = 'Organismo Operador de servicio...',
  userName = 'luis',
  onLogout,
  onNavigate,
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [shiftConfig, setShiftConfig] = useState({ nightStart: 23, nightEnd: 7 })
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Cargar configuración de turnos y logo
    loadShiftConfig()
    loadLogo()

    return () => clearInterval(timer)
  }, [])

  const loadShiftConfig = async () => {
    if (!window.electron) return
    try {
      const config = await window.electron.storage.get('shiftConfig')
      if (config) {
        setShiftConfig(config)
      }
    } catch (error) {
      console.error('Error loading shift config:', error)
    }
  }

  const loadLogo = async () => {
    if (!window.electron) return
    try {
      const logo = await window.electron.storage.get('empresaLogo')
      if (logo) {
        setLogoUrl(logo)
      }
    } catch (error) {
      console.error('Error loading logo:', error)
    }
  }

  const getGreeting = (date: Date) => {
    const hour = date.getHours()
    if (hour >= 6 && hour < 12) return 'Buenos días'
    if (hour >= 12 && hour < 20) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const getGreetingIcon = (date: Date) => {
    const hour = date.getHours()
    if (hour >= 6 && hour < 12) return <Sun className="w-4 h-4 text-amber-500" />
    if (hour >= 12 && hour < 20) return <Sunset className="w-4 h-4 text-orange-500" />
    return <Moon className="w-4 h-4 text-blue-400" />
  }

  const getShift = (date: Date) => {
    const hour = date.getHours()
    // Si la hora actual está entre nightStart y medianoche, o entre medianoche y nightEnd
    if (hour >= shiftConfig.nightStart || hour < shiftConfig.nightEnd) {
      return 'Nocturno'
    }
    return 'Diurno'
  }

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

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    }
  }

  return (
    <header className="bg-card border-b border-border px-6 py-3 shadow-sm">
      <div className="grid grid-cols-3 items-center">
        {/* Left: Gravio Logo + Greeting Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {getGreetingIcon(currentTime)}
            <span className="text-muted-foreground">{getGreeting(currentTime)} • Turno {getShift(currentTime)}</span>
          </div>
        </div>

        {/* Center: Company Logo and Name */}
        <div className="flex items-center justify-center gap-3">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Logo Empresa" 
              className="max-h-14 max-w-[180px] object-contain rounded-lg shadow-md border border-border/30 p-1.5 bg-secondary/30"
            />
          ) : (
            <div className="h-14 w-14 rounded-lg border-2 border-dashed border-border/50 bg-secondary/30 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex flex-col items-center">
            <span className="text-foreground font-semibold text-base">{empresaName}</span>
          </div>
        </div>

        {/* Right: Time, User, Settings */}
        <div className="flex items-center gap-4 justify-end">
          {/* Date and Time */}
          <div className="flex items-center gap-2.5 px-3 py-2 bg-secondary/50 rounded-lg border border-border/50">
            <Clock className="w-4 h-4 text-primary" />
            <div className="flex flex-col items-end">
              <span className="text-foreground font-semibold text-sm">{formatTime(currentTime)}</span>
              <span className="text-muted-foreground text-xs">{formatDate(currentTime)}</span>
            </div>
          </div>

          {/* User Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 h-auto hover:bg-secondary/80 rounded-lg border border-transparent hover:border-border/50 transition-all">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground text-sm font-medium capitalize">{userName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none capitalize">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">Operador del Sistema</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer"
                onSelect={() => onNavigate?.('company-config')}
              >
                <Building2 className="mr-2 h-4 w-4" />
                <span>Configuración de Empresa</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer"
                onSelect={() => onNavigate?.('historial')}
              >
                <History className="mr-2 h-4 w-4" />
                <span>Historial de Registros</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-secondary/80 rounded-lg border border-transparent hover:border-border/50 transition-all"
              >
                <Settings className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[450px] p-0 bg-card border-border shadow-lg" align="end" sideOffset={8}>
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
