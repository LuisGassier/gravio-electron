import { useEffect, useState } from 'react'
import { Dashboard } from './components/Dashboard'
import { SettingsPanel } from './components/SettingsPanel'
import { initSync } from './lib/sync'
import { Button } from './components/ui/button'
import { Settings, Home } from 'lucide-react'

type View = 'dashboard' | 'settings'

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard')

  useEffect(() => {
    // Inicializar sistema de sincronización
    initSync()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Gravio - Relleno Sanitario</h1>
          </div>
          <div className="flex gap-2">
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
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {currentView === 'dashboard' ? (
          <Dashboard />
        ) : (
          <div className="max-w-4xl mx-auto">
            <SettingsPanel />
          </div>
        )}
      </div>
    </div>
  )
}

export default App
