import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import type { Registro } from '@/domain'

interface PesajeContextType {
  selectedRegistro: Registro | null
  selectRegistroForSalida: (registro: Registro) => void
  clearSelection: () => void
  toggleRegistroSelection: (registro: Registro) => void
  notifySalidaRegistrada: () => void
  onSalidaRegistrada: (callback: () => void) => () => void
  notifyEntradaRegistrada: () => void
  onEntradaRegistrada: (callback: () => void) => () => void
}

const PesajeContext = createContext<PesajeContextType | undefined>(undefined)

export function PesajeProvider({ children }: { children: ReactNode }) {
  const [selectedRegistro, setSelectedRegistro] = useState<Registro | null>(null)
  const salidaCallbacksRef = useRef<Array<() => void>>([])
  const entradaCallbacksRef = useRef<Array<() => void>>([])

  const selectRegistroForSalida = useCallback((registro: Registro) => {
    setSelectedRegistro(registro)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedRegistro(null)
  }, [])

  const toggleRegistroSelection = useCallback((registro: Registro) => {
    // Si el mismo registro está seleccionado, deseleccionar
    setSelectedRegistro(prev => {
      if (prev?.id === registro.id) {
        return null
      } else {
        return registro
      }
    })
  }, [])

  const notifySalidaRegistrada = useCallback(() => {
    salidaCallbacksRef.current.forEach(callback => callback())
  }, [])

  const onSalidaRegistrada = useCallback((callback: () => void) => {
    salidaCallbacksRef.current.push(callback)

    // Retornar función para desuscribirse
    return () => {
      salidaCallbacksRef.current = salidaCallbacksRef.current.filter(cb => cb !== callback)
    }
  }, [])

  const notifyEntradaRegistrada = useCallback(() => {
    entradaCallbacksRef.current.forEach(callback => callback())
  }, [])

  const onEntradaRegistrada = useCallback((callback: () => void) => {
    entradaCallbacksRef.current.push(callback)

    // Retornar función para desuscribirse
    return () => {
      entradaCallbacksRef.current = entradaCallbacksRef.current.filter(cb => cb !== callback)
    }
  }, [])

  return (
    <PesajeContext.Provider value={{
      selectedRegistro,
      selectRegistroForSalida,
      clearSelection,
      toggleRegistroSelection,
      notifySalidaRegistrada,
      onSalidaRegistrada,
      notifyEntradaRegistrada,
      onEntradaRegistrada
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
