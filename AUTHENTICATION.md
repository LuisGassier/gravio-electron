# Sistema de Autenticación con Supabase

## 🔐 Resumen

El sistema ahora requiere autenticación para sincronizar datos con Supabase debido a que las tablas tienen **Row Level Security (RLS)** habilitado.

## 📋 Cómo Usar

### 1. Iniciar Sesión

1. Abre la aplicación
2. Verás un indicador "⚠️ Sin autenticar" en la barra superior
3. Haz clic en el botón **"Iniciar Sesión"**
4. Ingresa tu email
5. Elige autenticarte con **PIN** o **Contraseña**
6. Haz clic en **"Iniciar Sesión"**

### 2. Funcionamiento

- ✅ La sesión se guarda automáticamente
- ✅ Al reiniciar la app, la sesión se restaura automáticamente
- ✅ Solo los usuarios autenticados pueden sincronizar datos con Supabase
- ✅ Los datos locales siguen funcionando sin autenticación

### 3. Sincronización

Después de autenticarte:
- Los registros locales se sincronizan con Supabase
- Los vehículos y usuarios se descargan de Supabase
- La sincronización ocurre automáticamente cada 5 minutos

## 🔧 Función de Supabase

El sistema usa la función RPC `authenticate_user` que debe existir en tu base de datos:

```sql
-- Parámetros:
user_email text        -- Email del usuario
user_pin text          -- PIN (opcional)
user_password text     -- Contraseña (opcional)

-- Retorna:
TABLE(
  user_id uuid,
  nombre character varying,
  email character varying,
  activo boolean,
  pin character varying,
  password_hash character varying,
  pin_expires_at timestamp with time zone
)
```

## 📊 Estado de Sincronización

El estado de sincronización ahora incluye:

```typescript
{
  isOnline: boolean          // ¿Hay conexión a internet?
  isSyncing: boolean         // ¿Está sincronizando ahora?
  lastSync: Date | null      // Última sincronización exitosa
  pendingItems: number       // Items pendientes de sincronizar
  errors: string[]           // Errores de sincronización
  isAuthenticated: boolean   // ¿Usuario autenticado?
}
```

## 🛠️ API de Autenticación

### Importar funciones

```typescript
import { authenticateUser, signOut, getCurrentUserId } from './lib/sync'
```

### Autenticar con PIN

```typescript
const result = await authenticateUser('usuario@ejemplo.com', '1234')
if (result.success) {
  console.log('Usuario:', result.user)
}
```

### Autenticar con Contraseña

```typescript
const result = await authenticateUser('usuario@ejemplo.com', undefined, 'mi-password')
```

### Cerrar Sesión

```typescript
import { signOut } from './lib/sync'
await signOut()
```

### Obtener Usuario Actual

```typescript
import { getCurrentUserId } from './lib/sync'
const userId = getCurrentUserId()
```

## 🔍 Solución de Problemas

### Error: "relation does not exist"
- ✅ Solucionado: Ahora las tablas usan nombres en español (`vehiculos`, `usuarios`, `registros`)

### Error: "FOREIGN KEY constraint failed"
- ✅ Solucionado: Se requiere autenticación antes de insertar datos

### Error: "Usuario no autenticado"
- Inicia sesión usando el panel de login
- Verifica que tus credenciales sean correctas
- Asegúrate de que el usuario esté activo en la base de datos

## 📝 Tablas de Supabase

Las siguientes tablas deben existir en Supabase:

- ✅ `vehiculos` - Vehículos del sistema
- ✅ `usuarios` - Usuarios del sistema
- ✅ `registros` - Registros de pesaje
- ✅ `empresa` - Empresas
- ✅ `rutas` - Rutas
- ✅ `operadores` - Operadores
- ✅ `conceptos` - Conceptos de cobro

## 🔒 Seguridad

- Las credenciales se almacenan localmente de forma segura
- La sesión persiste entre reinicios de la app
- RLS protege los datos en Supabase
- Solo usuarios autenticados pueden acceder a los datos
