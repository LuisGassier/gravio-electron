import { useEffect, useState } from 'react'
import { Scale } from 'lucide-react'

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(onComplete, 300)
          return 100
        }
        return prev + 10
      })
    }, 100)

    return () => clearInterval(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/30">
            <Scale className="w-12 h-12 text-primary" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary animate-pulse"></div>
        </div>

        {/* App Name */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Gravio</h1>
          <p className="text-sm text-muted-foreground">Sistema de Báscula Industrial</p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading Text */}
        <p className="text-xs text-muted-foreground animate-pulse">
          Cargando módulos del sistema...
        </p>
      </div>

      {/* Version */}
      <div className="absolute bottom-8 text-xs text-muted-foreground">
        v1.0.4
      </div>
    </div>
  )
}
