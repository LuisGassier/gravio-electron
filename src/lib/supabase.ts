import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan variables de entorno de Supabase')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})

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
