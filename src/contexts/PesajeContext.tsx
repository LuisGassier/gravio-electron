import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Registro } from '@/domain'

interface PesajeContextType {
  selectedRegistro: Registro | null
  selectRegistroForSalida: (registro: Registro) => void
  clearSelection: () => void
  toggleRegistroSelection: (registro: Registro) => void
  notifySalidaRegistrada: () => void
  onSalidaRegistrada: (callback: () => void) => () => void
}

const PesajeContext = createContext<PesajeContextType | undefined>(undefined)

export function PesajeProvider({ children }: { children: ReactNode }) {
  const [selectedRegistro, setSelectedRegistro] = useState<Registro | null>(null)
  const [salidaCallbacks, setSalidaCallbacks] = useState<Array<() => void>>([])

  const selectRegistroForSalida = (registro: Registro) => {
    console.log('📋 Registro seleccionado para salida:', registro)
    setSelectedRegistro(registro)
  }

  const clearSelection = () => {
    console.log('🔄 Limpiando selección')
    setSelectedRegistro(null)
  }

  const toggleRegistroSelection = (registro: Registro) => {
    // Si el mismo registro está seleccionado, deseleccionar
    if (selectedRegistro?.id === registro.id) {
      console.log('❌ Deseleccionando registro:', registro.placaVehiculo)
      setSelectedRegistro(null)
    } else {
      console.log('✅ Seleccionando registro:', registro.placaVehiculo)
      setSelectedRegistro(registro)
    }
  }

  const notifySalidaRegistrada = () => {
    console.log('🔔 Notificando salida registrada a', salidaCallbacks.length, 'listeners')
    salidaCallbacks.forEach(callback => callback())
  }

  const onSalidaRegistrada = (callback: () => void) => {
    setSalidaCallbacks(prev => [...prev, callback])
    
    // Retornar función para desuscribirse
    return () => {
      setSalidaCallbacks(prev => prev.filter(cb => cb !== callback))
    }
  }

  return (
    <PesajeContext.Provider value={{ 
      selectedRegistro, 
      selectRegistroForSalida, 
      clearSelection, 
      toggleRegistroSelection,
      notifySalidaRegistrada,
      onSalidaRegistrada
    }}>
      {children}
    </PesajeContext.Provider>
  )
}

export function usePesaje() {
  const context = useContext(PesajeContext)
  if (context === undefined) {
    throw new Error('usePesaje must be used within a PesajeProvider')
  }
  return context
}
