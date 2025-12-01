import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { authenticateUser, getSyncStatus } from '../lib/sync'
import { Mail, Lock, KeyRound, LogIn, CheckCircle2, AlertCircle, Loader2, Shield } from 'lucide-react'

interface LoginPanelProps {
  onLoginSuccess?: () => void
}

export function LoginPanel({ onLoginSuccess }: LoginPanelProps = {}) {
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [password, setPassword] = useState('')
  const [usePin, setUsePin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(getSyncStatus().isAuthenticated)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await authenticateUser(
        email,
        usePin ? pin : undefined,
        usePin ? undefined : password
      )

      if (result.success) {
        setIsAuthenticated(true)
        console.log('✅ Login exitoso:', result.user)
        
        // Notificar al componente padre sobre el éxito del login
        if (onLoginSuccess) {
          onLoginSuccess()
        }
      } else {
        setError(result.error || 'Error de autenticación')
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  if (isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto card-elevated">
        <CardHeader className="space-y-3 pb-6">
          <div className="mx-auto w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-success" />
          </div>
          <CardTitle className="text-center text-2xl">Sesión Activa</CardTitle>
          <CardDescription className="text-center">
            Ya estás autenticado en el sistema
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Logo y Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-white font-bold text-4xl">G</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Bienvenido a Gravio</h1>
          <p className="text-muted-foreground">
            Sistema de Gestión de Relleno Sanitario
          </p>
        </div>
      </div>

      {/* Login Card */}
      <Card className="card-elevated border-2">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Iniciar Sesión
          </CardTitle>
          <CardDescription>
            Autentícate para acceder al sistema y sincronizar datos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Correo Electrónico
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  className="pl-10 h-11 bg-background/50"
                  required
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Auth Method Toggle */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Método de Autenticación</Label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/50 rounded-lg">
                <button
                  type="button"
                  onClick={() => setUsePin(true)}
                  className={`
                    flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium
                    transition-all duration-200
                    ${usePin 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  <KeyRound className="w-4 h-4" />
                  PIN
                </button>
                <button
                  type="button"
                  onClick={() => setUsePin(false)}
                  className={`
                    flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium
                    transition-all duration-200
                    ${!usePin 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  <Lock className="w-4 h-4" />
                  Contraseña
                </button>
              </div>
            </div>

            {/* PIN or Password Input */}
            {usePin ? (
              <div className="space-y-2">
                <Label htmlFor="pin" className="text-sm font-medium flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-muted-foreground" />
                  PIN de Acceso
                </Label>
                <div className="relative">
                  <Input
                    id="pin"
                    type="text"
                    inputMode="numeric"
                    value={pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setPin(value)
                    }}
                    placeholder="Ingresa tu PIN"
                    className="pl-10 h-11 bg-background/50 text-center text-lg tracking-widest font-mono"
                    maxLength={6}
                    required
                  />
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                <p className="text-xs text-muted-foreground">PIN de 4-6 dígitos</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="pl-10 h-11 bg-background/50"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 text-sm bg-destructive/10 border border-destructive/30 text-destructive rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Error de autenticación</p>
                  <p className="text-xs mt-1 opacity-90">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Verificando credenciales...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Iniciar Sesión
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <div className="text-center text-xs text-muted-foreground space-y-1">
        <p>Al iniciar sesión, aceptas los términos y condiciones de uso</p>
        <p className="flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" />
          Conexión segura con cifrado de extremo a extremo
        </p>
      </div>
    </div>
  )
}
