import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Registro } from '@/domain'

interface PesajeContextType {
  selectedRegistro: Registro | null
  selectRegistroForSalida: (registro: Registro) => void
  clearSelection: () => void
}

const PesajeContext = createContext<PesajeContextType | undefined>(undefined)

export function PesajeProvider({ children }: { children: ReactNode }) {
  const [selectedRegistro, setSelectedRegistro] = useState<Registro | null>(null)

  const selectRegistroForSalida = (registro: Registro) => {
    console.log('📋 Registro seleccionado para salida:', registro)
    setSelectedRegistro(registro)
  }

  const clearSelection = () => {
    setSelectedRegistro(null)
  }

  return (
    <PesajeContext.Provider value={{ selectedRegistro, selectRegistroForSalida, clearSelection }}>
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
