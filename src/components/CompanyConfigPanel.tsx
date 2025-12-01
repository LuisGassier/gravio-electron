import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Building2, Save, Upload, X, Image as ImageIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface CompanyConfig {
  nombre: string
  direccion: string
  logo: string
}

interface CompanyConfigPanelProps {
  onClose?: () => void
  onSave?: () => void
}

export function CompanyConfigPanel({ onClose, onSave }: CompanyConfigPanelProps) {
  const [config, setConfig] = useState<CompanyConfig>({
    nombre: '',
    direccion: '',
    logo: ''
  })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    if (!window.electron) return

    try {
      // Obtener configuración de la empresa desde la base de datos
      const empresas = await window.electron.db.query(
        'SELECT nombre, direccion, logo FROM empresa LIMIT 1',
        []
      )

      if (empresas.length > 0) {
        const empresa = empresas[0]
        setConfig({
          nombre: empresa.nombre || '',
          direccion: empresa.direccion || '',
          logo: empresa.logo || ''
        })

        if (empresa.logo) {
          setLogoPreview(empresa.logo)
        }
      }
    } catch (error) {
      console.error('Error cargando configuración de empresa:', error)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida')
      return
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no debe superar 2MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setLogoPreview(dataUrl)
      setConfig({ ...config, logo: dataUrl })
      toast.success('Logo cargado correctamente')
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setLogoPreview(null)
    setConfig({ ...config, logo: '' })
    toast.success('Logo eliminado')
  }

  const saveConfig = async () => {
    if (!window.electron) return

    if (!config.nombre.trim()) {
      toast.error('El nombre de la empresa es obligatorio')
      return
    }

    setSaving(true)

    try {
      // Verificar si ya existe una empresa configurada
      const empresas = await window.electron.db.query(
        'SELECT clave_empresa FROM empresa LIMIT 1',
        []
      )

      if (empresas.length > 0) {
        // Actualizar empresa existente
        await window.electron.db.query(
          'UPDATE empresa SET nombre = ?, direccion = ?, logo = ? WHERE clave_empresa = ?',
          [config.nombre, config.direccion, config.logo, empresas[0].clave_empresa]
        )
      } else {
        // Insertar nueva empresa
        await window.electron.db.query(
          'INSERT INTO empresa (nombre, direccion, logo, prefijo) VALUES (?, ?, ?, ?)',
          [config.nombre, config.direccion, config.logo, 'EMP']
        )
      }

      // Guardar también en storage para acceso rápido
      await window.electron.storage.set('empresaLogo', config.logo)
      await window.electron.storage.set('empresaName', config.nombre)

      toast.success('Configuración de empresa guardada correctamente')
      onSave?.()
      onClose?.()
    } catch (error) {
      console.error('Error guardando configuración:', error)
      toast.error('Error al guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Configuración de Empresa</h2>
            <p className="text-sm text-muted-foreground">Información general de la organización</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Logo Section */}
      <Card className="card-elevated p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Logotipo</h3>
          </div>

          <div className="flex items-start gap-6">
            <div className="relative">
              {logoPreview ? (
                <div className="relative group">
                  <img 
                    src={logoPreview} 
                    alt="Logo empresa" 
                    className="h-32 w-32 object-contain rounded-lg border-2 border-border bg-secondary/30 p-2"
                  />
                  <button
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 p-1.5 bg-destructive rounded-full hover:bg-destructive/80 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <div className="h-32 w-32 rounded-lg border-2 border-dashed border-border/50 bg-secondary/30 flex flex-col items-center justify-center gap-2">
                  <ImageIcon className="w-10 h-10 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Sin logo</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <label 
                  htmlFor="company-logo-upload" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg cursor-pointer transition-colors font-medium"
                >
                  <Upload className="w-4 h-4" />
                  <span>Cargar Logotipo</span>
                </label>
                <input
                  id="company-logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Formatos recomendados: PNG con fondo transparente o JPG/SVG.<br />
                Tamaño máximo: 2MB. Dimensiones recomendadas: 200x200px.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Company Information */}
      <Card className="card-elevated p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Información de la Empresa
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-medium flex items-center gap-1">
                Nombre de la Empresa
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nombre"
                value={config.nombre}
                onChange={(e) => setConfig({ ...config, nombre: e.target.value })}
                placeholder="Ej: Servicios Ambientales del Estado"
                className="bg-secondary/50 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion" className="text-sm font-medium">
                Dirección
              </Label>
              <Textarea
                id="direccion"
                value={config.direccion}
                onChange={(e) => setConfig({ ...config, direccion: e.target.value })}
                placeholder="Dirección completa de la empresa"
                className="bg-secondary/50 border-border min-h-[100px] resize-none"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <p className="text-sm text-muted-foreground">
          <span className="text-destructive">*</span> Campos obligatorios
        </p>
        <div className="flex gap-3">
          {onClose && (
            <Button variant="outline" onClick={onClose} className="w-32">
              Cancelar
            </Button>
          )}
          <Button 
            onClick={saveConfig}
            disabled={saving || !config.nombre.trim()}
            className="w-32 bg-primary hover:bg-primary/90"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
