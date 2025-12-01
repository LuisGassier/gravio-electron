import { supabase } from './supabase'

export type AppVersion = {
  id: number
  version: string
  platform: string
  download_url: string
  file_name: string
  file_size: number
  release_notes: string | null
  release_date: string | null
  is_required: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export type UpdateCheckResult = {
  hasUpdate: boolean
  latestVersion?: AppVersion
  currentVersion: string
}

/**
 * Compara versiones en formato semver (x.y.z)
 * Retorna: 1 si version1 > version2, -1 si version1 < version2, 0 si son iguales
 */
function compareVersions(version1: string, version2: string): number {
  const v1Parts = version1.split('.').map(Number)
  const v2Parts = version2.split('.').map(Number)
  
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1 = v1Parts[i] || 0
    const v2 = v2Parts[i] || 0
    
    if (v1 > v2) return 1
    if (v1 < v2) return -1
  }
  
  return 0
}

/**
 * Verifica si hay actualizaciones disponibles
 */
export async function checkForUpdates(): Promise<UpdateCheckResult> {
  try {
    const currentVersion = import.meta.env.VITE_APP_VERSION || '1.0.0'
    
    // Consultar la versión más reciente de Supabase para Windows
    const { data, error } = await supabase
      .from('app_versions')
      .select('*')
      .eq('platform', 'windows')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Error checking for updates:', error)
      return {
        hasUpdate: false,
        currentVersion
      }
    }

    if (!data) {
      return {
        hasUpdate: false,
        currentVersion
      }
    }

    // Comparar versiones
    const comparison = compareVersions(data.version, currentVersion)
    
    return {
      hasUpdate: comparison > 0,
      latestVersion: data,
      currentVersion
    }
  } catch (error) {
    console.error('Error checking for updates:', error)
    return {
      hasUpdate: false,
      currentVersion: import.meta.env.VITE_APP_VERSION || '1.0.0'
    }
  }
}

/**
 * Registra el inicio de una descarga de actualización
 */
export async function trackDownloadStart(version: string, platform: string = 'windows') {
  try {
    const { error } = await supabase
      .from('app_update_downloads')
      .insert({
        version,
        platform,
        user_agent: navigator.userAgent,
        download_started_at: new Date().toISOString(),
        success: false
      })

    if (error) {
      console.error('Error tracking download start:', error)
    }
  } catch (error) {
    console.error('Error tracking download start:', error)
  }
}

/**
 * Registra el éxito de una descarga
 */
export async function trackDownloadSuccess(version: string) {
  try {
    const { error } = await supabase
      .from('app_update_downloads')
      .update({
        download_completed_at: new Date().toISOString(),
        success: true
      })
      .eq('version', version)
      .eq('success', false)
      .order('download_started_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Error tracking download success:', error)
    }
  } catch (error) {
    console.error('Error tracking download success:', error)
  }
}

/**
 * Formatea el tamaño de archivo en MB
 */
export function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(1)} MB`
}

/**
 * Formatea la fecha de lanzamiento
 */
export function formatReleaseDate(dateString: string | null): string {
  if (!dateString) return 'Fecha no disponible'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
