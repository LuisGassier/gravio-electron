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

// Estado de autenticación
let isAuthenticated = false
let currentUserId: string | null = null
let currentUserEmail: string | null = null
let currentUserName: string | null = null

/**
 * Autenticar usuario con email y PIN o contraseña
 */
export async function authenticateUser(
  email: string,
  pin?: string,
  password?: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase no configurado' }
  }

  try {
    const { data, error } = await supabase.rpc('authenticate_user', {
      user_email: email,
      user_pin: pin || null,
      user_password: password || null,
    })

    if (error) {
      console.error('❌ Error de autenticación:', error)
      return { success: false, error: error.message }
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'Credenciales inválidas' }
    }

    const user = data[0]
    isAuthenticated = true
    currentUserId = user.user_id
    currentUserEmail = user.email
    currentUserName = user.nombre

    // Guardar sesión localmente
    if (window.electron) {
      await window.electron.storage.set('supabase_user', {
        id: user.user_id,
        email: user.email,
        nombre: user.nombre,
        activo: user.activo,
      })
    }

    console.log('✅ Usuario autenticado:', user.email)
    return { success: true, user }
  } catch (error: any) {
    console.error('❌ Error en autenticación:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Cerrar sesión
 */
export async function signOut() {
  isAuthenticated = false
  currentUserId = null
  currentUserEmail = null
  currentUserName = null

  if (window.electron) {
    await window.electron.storage.delete('supabase_user')
  }

  console.log('✅ Sesión cerrada')
}

/**
 * Verificar si hay una sesión activa
 */
export function isUserAuthenticated(): boolean {
  return isAuthenticated
}

/**
 * Obtener ID del usuario actual
 */
export function getCurrentUserId(): string | null {
  return currentUserId
}

/**
 * Obtener email del usuario actual
 */
export function getCurrentUserEmail(): string | null {
  return currentUserEmail
}

/**
 * Obtener nombre del usuario actual
 */
export function getCurrentUserName(): string | null {
  return currentUserName
}

/**
 * Obtener información completa del usuario actual desde storage
 */
export async function getCurrentUser(): Promise<{
  id: string
  email: string
  nombre: string
} | null> {
  if (!window.electron) return null

  try {
    const savedUser = await window.electron.storage.get('supabase_user')
    if (savedUser && savedUser.id) {
      return {
        id: savedUser.id,
        email: savedUser.email,
        nombre: savedUser.nombre,
      }
    }
  } catch (error) {
    console.error('❌ Error al obtener usuario actual:', error)
  }

  return null
}

/**
 * Restaurar sesión guardada
 */
export async function restoreSession(): Promise<boolean> {
  if (!window.electron || !supabase) return false

  try {
    const savedUser = await window.electron.storage.get('supabase_user')
    if (savedUser && savedUser.id) {
      isAuthenticated = true
      currentUserId = savedUser.id
      currentUserEmail = savedUser.email
      currentUserName = savedUser.nombre
      console.log('✅ Sesión restaurada:', savedUser.email)
      return true
    }
  } catch (error) {
    console.error('❌ Error al restaurar sesión:', error)
  }

  return false
}

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
