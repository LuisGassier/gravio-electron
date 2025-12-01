# Sistema de Actualizaciones

El sistema de actualizaciones de Gravio permite detectar y notificar a los usuarios cuando hay nuevas versiones disponibles del software.

## Arquitectura

### Tablas de Supabase

#### `app_versions`
Almacena información sobre las versiones disponibles del software:
- `version`: Versión semver (ej: 1.0.4)
- `platform`: Plataforma (windows, mac, linux)
- `download_url`: URL de descarga del instalador
- `file_name`: Nombre del archivo (ej: gravio-setup-1.0.1.exe)
- `file_size`: Tamaño del archivo en bytes
- `release_notes`: Notas de la versión
- `release_date`: Fecha de lanzamiento
- `is_required`: Si la actualización es obligatoria
- `is_active`: Si la versión está activa y disponible

#### `app_update_downloads`
Registra las descargas de actualizaciones (analytics):
- `version`: Versión descargada
- `platform`: Plataforma
- `user_agent`: User agent del navegador
- `ip_address`: IP del cliente (automático)
- `download_started_at`: Timestamp del inicio
- `download_completed_at`: Timestamp de completado
- `success`: Si la descarga fue exitosa

## Componentes

### `src/lib/updater.ts`
Servicio principal que maneja:
- `checkForUpdates()`: Verifica si hay actualizaciones disponibles
- `compareVersions()`: Compara versiones semver
- `trackDownloadStart()`: Registra inicio de descarga
- `trackDownloadSuccess()`: Registra descarga exitosa
- `formatFileSize()`: Formatea tamaño de archivo
- `formatReleaseDate()`: Formatea fecha de lanzamiento

### `src/components/UpdateNotificationDialog.tsx`
Dialog que muestra:
- Información de la nueva versión
- Versión actual vs nueva versión
- Notas de lanzamiento
- Tamaño del archivo
- Botón para descargar
- Advertencia si es actualización obligatoria

### `src/components/StatusPanel.tsx`
Panel de estado que:
- Verifica actualizaciones al iniciar
- Verifica cada 30 minutos
- Muestra banner cuando hay actualización disponible
- Muestra diálogo automáticamente si es obligatoria

## Flujo de Actualización

1. **Detección**: El sistema verifica cada 30 minutos o al iniciar
2. **Comparación**: Compara versión local vs versión en Supabase
3. **Notificación**: 
   - Si `is_required = true`: Muestra diálogo automáticamente
   - Si `is_required = false`: Muestra banner en StatusPanel
4. **Descarga Automática**: Al hacer clic en "Actualizar ahora":
   - Registra inicio de descarga en `app_update_downloads`
   - Descarga el .exe a la carpeta Downloads del usuario
   - Muestra barra de progreso en tiempo real
   - Al completar, ejecuta el instalador automáticamente
5. **Instalación Automática**: 
   - El instalador se ejecuta automáticamente
   - La aplicación se cierra
   - Usuario completa el proceso de instalación guiado

## Cómo Publicar una Actualización

### 1. Actualizar versión en package.json
```json
{
  "version": "1.0.4"
}
```

### 2. Build del instalador
```bash
npm run build:electron
```

### 3. Subir el .exe a un servidor
- Puede ser un servidor web, AWS S3, GitHub Releases, etc.
- Obtener la URL pública del archivo

### 4. Insertar registro en Supabase
```sql
INSERT INTO app_versions (
  version,
  platform,
  download_url,
  file_name,
  file_size,
  release_notes,
  release_date,
  is_required,
  is_active
) VALUES (
  '1.0.4',
  'windows',
  'https://tu-servidor.com/gravio-setup-1.0.4.exe',
  'gravio-setup-1.0.4.exe',
  10485760, -- tamaño en bytes (10.5 MB)
  'Corrección de errores de conexión serial y mejoras en el sistema de actualizaciones',
  '2025-09-20',
  true, -- obligatoria
  true  -- activa
);
```

### 5. Los clientes detectarán automáticamente
- En el próximo check (cada 30 min o al reiniciar)
- Verán la notificación de actualización

## Versiones Semver

El sistema usa semantic versioning (MAJOR.MINOR.PATCH):
- `1.0.0` -> `1.0.1`: Actualización de parche
- `1.0.0` -> `1.1.0`: Actualización minor
- `1.0.0` -> `2.0.0`: Actualización major

La comparación es automática y robusta.

## Actualizaciones Obligatorias

Si `is_required = true`:
- Se muestra el diálogo automáticamente
- No hay opción de "Más tarde"
- Advertencia de seguridad visible

## Variables de Entorno

La versión se obtiene automáticamente de `package.json` mediante:
```typescript
import.meta.env.VITE_APP_VERSION
```

Configurado en `vite.config.ts`:
```typescript
define: {
  'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
}
```

## Monitoreo

La tabla `app_update_downloads` permite monitorear:
- Cuántas descargas se iniciaron
- Cuántas se completaron
- Tasas de éxito/fallo
- Plataformas más usadas
- User agents de los clientes

## Características Implementadas

- ✅ Descarga automática del instalador
- ✅ Barra de progreso en tiempo real
- ✅ Ejecución automática del instalador
- ✅ Cierre automático de la app para instalar
- ✅ Analytics de descargas en Supabase
- ✅ Detección automática cada 30 minutos
- ✅ Diálogo modal con detalles completos
- ✅ Banner de notificación en StatusPanel

## Mejoras Futuras

- [ ] Verificación de integridad (checksums)
- [ ] Actualizaciones delta (solo diferencias)
- [ ] Rollback automático en caso de error
- [ ] Notificaciones push para actualizaciones críticas
- [ ] Instalación silenciosa en segundo plano
- [ ] Reinicio automático después de instalar
