import { useEffect, useState } from 'react'
import { Dashboard } from './components/Dashboard'
import { SettingsPanel } from './components/SettingsPanel'
import { LoginPanel } from './components/LoginPanel'
import { Header } from './components/Header'
import { initSync, getSyncStatus, onSyncStatusChange } from './lib/sync'

type View = 'dashboard' | 'settings' | 'login'

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState<string>('luis')
  const [empresaName, setEmpresaName] = useState<string>('Organismo Operador de servicio...')

  useEffect(() => {
    // Inicializar sistema de sincronización
    initSync().then(() => {
      setIsAuthenticated(getSyncStatus().isAuthenticated)
    })

    // Escuchar cambios en el estado de autenticación
    const unsubscribe = onSyncStatusChange((status) => {
      setIsAuthenticated(status.isAuthenticated)
    })

    // Cargar información de usuario y empresa
    loadUserInfo()

    return () => unsubscribe()
  }, [])

  const loadUserInfo = async () => {
    if (!window.electron) return

    try {
      // Get user from local storage or database
      const storedUser = await window.electron.storage.get('currentUser')
      if (storedUser) {
        setUserName(storedUser)
      }

      // Get empresa info
      const empresas = await window.electron.db.query('SELECT nombre FROM empresa LIMIT 1', [])
      if (empresas.length > 0) {
        setEmpresaName(empresas[0].nombre)
      }
    } catch (error) {
      console.error('Error loading user info:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Header
        empresaName={empresaName}
        userName={userName}
        onSettingsClick={() => setCurrentView('settings')}
      />

      {/* Content */}
      <div className="flex-1 p-6">
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
