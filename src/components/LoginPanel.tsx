import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { authenticateUser, getSyncStatus } from '../lib/sync'

export function LoginPanel() {
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
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>✅ Sesión Activa</CardTitle>
          <CardDescription>Ya estás autenticado en Supabase</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Iniciar Sesión</CardTitle>
        <CardDescription>
          Autentícate para sincronizar con Supabase
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="usuario@ejemplo.com"
              required
            />
          </div>

          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={usePin}
                onChange={() => setUsePin(true)}
              />
              <span>Usar PIN</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!usePin}
                onChange={() => setUsePin(false)}
              />
              <span>Usar Contraseña</span>
            </label>
          </div>

          {usePin ? (
            <div>
              <label htmlFor="pin" className="block text-sm font-medium mb-2">
                PIN
              </label>
              <input
                id="pin"
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="1234"
                maxLength={6}
                required
              />
            </div>
          ) : (
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="••••••••"
                required
              />
            </div>
          )}

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
