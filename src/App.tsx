import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'
import { Dashboard } from './components/Dashboard'
import { LoginPanel } from './components/LoginPanel'
import { Header } from './components/Header'
import { SplashScreen } from './components/SplashScreen'
import { CompanyConfigPanel } from './components/CompanyConfigPanel'
import { initSync, getSyncStatus, onSyncStatusChange } from './lib/sync'

type View = 'dashboard' | 'login' | 'company-config'

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState<string>('')
  const [empresaName, setEmpresaName] = useState<string>('Organismo Operador de servicio...')
  const [showSplash, setShowSplash] = useState(true)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    // Verificar sesión guardada y cargar información
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      // Inicializar sistema de sincronización (intenta restaurar sesión)
      await initSync()
      const syncStatus = getSyncStatus()
      
      setIsAuthenticated(syncStatus.isAuthenticated)
      
      // Si no hay sesión, ir a login
      if (!syncStatus.isAuthenticated) {
        setCurrentView('login')
      }

      // Escuchar cambios en el estado de autenticación
      const unsubscribe = onSyncStatusChange((status) => {
        setIsAuthenticated(status.isAuthenticated)
        
        // Si pierde la autenticación, ir a login
        if (!status.isAuthenticated && currentView !== 'login') {
          setCurrentView('login')
        }
      })

      // Cargar información de usuario y empresa
      await loadUserInfo()

      return () => unsubscribe()
    } finally {
      setCheckingSession(false)
    }
  }

  const loadUserInfo = async () => {
    if (!window.electron) return

    try {
      // Get user from Supabase session
      const supabaseUser = await window.electron.storage.get('supabase_user')
      if (supabaseUser && supabaseUser.nombre) {
        setUserName(supabaseUser.nombre)
      } else {
        // Fallback a currentUser para compatibilidad
        const storedUser = await window.electron.storage.get('currentUser')
        if (storedUser) {
          setUserName(storedUser)
        }
      }

      // Get empresa operadora del software (solo local, no DB)
      const companyName = await window.electron.storage.get('empresaName') || 
                          await window.electron.storage.get('companyName')
      if (companyName) {
        setEmpresaName(companyName)
      }
    } catch (error) {
      console.error('Error loading user info:', error)
    }
  }

  // Mostrar splash mientras se carga
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  // Mostrar loading mientras se verifica sesión
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    if (!window.electron) return
    
    try {
      // Importar signOut dinámicamente para evitar ciclos
      const { signOut } = await import('./lib/sync')
      await signOut()
      
      // Limpiar estado local
      setUserName('')
      setIsAuthenticated(false)
      setCurrentView('login')
      
      console.log('✅ Sesión cerrada correctamente')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="top-center" richColors />
      {/* Header - Solo mostrar cuando está autenticado */}
      {isAuthenticated && (
        <Header
          empresaName={empresaName}
          userName={userName}
          onLogout={handleLogout}
          onNavigate={(view) => setCurrentView(view as View)}
        />
      )}

      {/* Content */}
      <div className="flex-1 p-6">
        {currentView === 'dashboard' && isAuthenticated && <Dashboard />}
        {currentView === 'login' && (
          <div className="flex items-center justify-center min-h-screen py-12 bg-gradient-to-br from-background via-background to-secondary/20">
            <LoginPanel onLoginSuccess={() => {
              setIsAuthenticated(true)
              setCurrentView('dashboard')
              loadUserInfo()
            }} />
          </div>
        )}
        {currentView === 'company-config' && isAuthenticated && (
          <div className="max-w-4xl mx-auto">
            <CompanyConfigPanel 
              onClose={() => setCurrentView('dashboard')}
              onSave={() => {
                loadUserInfo() // Recargar info de empresa
                setCurrentView('dashboard')
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default App
