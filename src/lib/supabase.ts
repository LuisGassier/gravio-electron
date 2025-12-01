import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validar que las credenciales no sean las de ejemplo
const hasValidCredentials = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('tu-proyecto') &&
  !supabaseAnonKey.includes('tu-api-key')

if (!hasValidCredentials) {
  console.warn('⚠️ Supabase no configurado. Usando solo almacenamiento local.')
  console.warn('Para habilitar sincronización, configura .env.local con tus credenciales de Supabase')
}

export const supabase = hasValidCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null as any // Modo offline puro

// Types para TypeScript
export type Transaction = {
  id: string
  type: string
  weight: number
  vehicle_plate?: string
  driver_name?: string
  waste_type?: string
  timestamp: number
  user_id?: string
  synced?: boolean
  created_at?: string
}

export type Vehicle = {
  id: string
  plate: string
  type?: string
  owner?: string
  created_at?: string
}

export type User = {
  id: string
  email: string
  full_name?: string
  role?: string
  created_at?: string
}
