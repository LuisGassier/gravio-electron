import { useEffect, useState } from 'react'
import { Dashboard } from './components/Dashboard'
import { SettingsPanel } from './components/SettingsPanel'
import { LoginPanel } from './components/LoginPanel'
import { initSync, getSyncStatus, onSyncStatusChange } from './lib/sync'
import { Button } from './components/ui/button'
import { Settings, Home, LogIn } from 'lucide-react'

type View = 'dashboard' | 'settings' | 'login'

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Inicializar sistema de sincronización
    initSync().then(() => {
      setIsAuthenticated(getSyncStatus().isAuthenticated)
    })

    // Escuchar cambios en el estado de autenticación
    const unsubscribe = onSyncStatusChange((status) => {
      setIsAuthenticated(status.isAuthenticated)
    })

    return () => unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Gravio - Relleno Sanitario</h1>
          </div>
          <div className="flex gap-2 items-center">
            {!isAuthenticated && (
              <span className="text-sm text-yellow-600 mr-2">
                ⚠️ Sin autenticar
              </span>
            )}
            <Button
              variant={currentView === 'dashboard' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('dashboard')}
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={currentView === 'settings' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('settings')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </Button>
            <Button
              variant={currentView === 'login' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('login')}
            >
              <LogIn className="w-4 h-4 mr-2" />
              {isAuthenticated ? 'Sesión' : 'Iniciar Sesión'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {currentView === 'dashboard' ? (
          <Dashboard />
        ) : currentView === 'settings' ? (
          <div className="max-w-4xl mx-auto">
            <SettingsPanel />
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <LoginPanel />
          </div>
        )}
      </div>
    </div>
  )
}

export default App
