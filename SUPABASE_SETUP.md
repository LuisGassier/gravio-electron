# 🔧 Configuración de Supabase

## Paso 1: Obtener Credenciales

1. Ve a [supabase.com](https://supabase.com) e inicia sesión
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a **Settings** → **API**
4. Copia los siguientes valores:
   - **Project URL** (ejemplo: `https://abcdefgh.supabase.co`)
   - **anon public** key (la clave que dice "anon public")

## Paso 2: Configurar Variables de Entorno

Edita el archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-api-key-anon
```

**Reemplaza** los valores con los que copiaste en el paso anterior.

## Paso 3: Crear Tablas en Supabase

Ve a **SQL Editor** en tu proyecto de Supabase y ejecuta:

```sql
-- Tabla de transacciones
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  weight REAL NOT NULL,
  vehicle_plate TEXT,
  driver_name TEXT,
  waste_type TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de vehículos
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate TEXT UNIQUE NOT NULL,
  type TEXT,
  owner TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de usuarios (si usas autenticación custom)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'operator',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso (ajustar según necesidades)
-- Permitir lectura a usuarios autenticados
CREATE POLICY "Permitir lectura a autenticados" 
  ON transactions FOR SELECT 
  TO authenticated 
  USING (true);

-- Permitir inserción a usuarios autenticados
CREATE POLICY "Permitir inserción a autenticados" 
  ON transactions FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Permitir actualización a usuarios autenticados
CREATE POLICY "Permitir actualización a autenticados" 
  ON transactions FOR UPDATE 
  TO authenticated 
  USING (true);

-- Políticas para vehículos
CREATE POLICY "Permitir lectura vehículos" 
  ON vehicles FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Permitir inserción vehículos" 
  ON vehicles FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Permitir actualización vehículos" 
  ON vehicles FOR UPDATE 
  TO authenticated 
  USING (true);

-- Políticas para usuarios
CREATE POLICY "Permitir lectura usuarios" 
  ON users FOR SELECT 
  TO authenticated 
  USING (true);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_vehicle ON transactions(vehicle_plate);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(plate);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_vehicles_updated_at 
  BEFORE UPDATE ON vehicles 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();
```

## Paso 4: Verificar la Configuración

Reinicia la aplicación:

```bash
npm run dev
```

Deberías ver en la consola:
- ✅ Sin warnings de "Supabase no configurado"
- ✅ Conexión a Supabase establecida

## 🔒 Seguridad Adicional (Opcional)

### Deshabilitar registro público

Si no quieres que cualquiera pueda registrarse:

1. Ve a **Authentication** → **Settings**
2. Desactiva "Enable email signups"

### Configurar email de confirmación

1. Ve a **Authentication** → **Settings**
2. Habilita "Enable email confirmations"
3. Configura tu plantilla de email

### Variables de entorno seguras

Para producción, considera usar:
- **Secrets** de GitHub Actions para CI/CD
- **Variables de entorno** del sistema operativo
- **Electron Store** con encriptación para datos sensibles

## 🚀 Modo Offline

La app funciona **sin Supabase configurado**:
- ✅ Todos los datos se guardan en SQLite local
- ✅ No hay sincronización remota
- ✅ Perfecto para testing o uso sin internet

Una vez configures Supabase, la sincronización es automática.

## 📝 Notas

- Las credenciales en `.env.local` **NO** deben subirse a Git
- El archivo `.env.local` está en `.gitignore` por defecto
- Usa `.env.example` como plantilla para otros desarrolladores
- La `anon` key es segura para el frontend (tiene RLS)
