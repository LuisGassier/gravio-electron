import { useEffect } from 'react'
import { Dashboard } from './components/Dashboard'
import { initSync } from './lib/sync'

function App() {
  useEffect(() => {
    // Inicializar sistema de sincronización
    initSync()
  }, [])

  return <Dashboard />
}

export default App
