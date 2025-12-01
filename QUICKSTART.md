# 🚀 Inicio Rápido - Gravio Electron

## ⚡ Para Empezar en 3 Pasos

### Paso 1: Configurar Variables de Entorno

Crea el archivo `.env.local`:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-api-key-anon
VITE_COM_PORT=COM2
VITE_COM_BAUDRATE=2400
```

### Paso 2: Configurar Base de Datos

Ve a [supabase.com](https://supabase.com) → SQL Editor y ejecuta:

```sql
-- Tabla de transacciones
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plate TEXT UNIQUE NOT NULL,
  type TEXT,
  owner TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Políticas básicas
CREATE POLICY "Permitir lectura a autenticados" 
  ON transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir inserción a autenticados" 
  ON transactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Permitir lectura vehículos" 
  ON vehicles FOR SELECT TO authenticated USING (true);
```

### Paso 3: Ejecutar la App

```bash
npm run dev
```

La app se abrirá automáticamente en Electron.

---

## 🎮 Uso Básico

1. **Conectar Báscula**
   - Click en "Conectar Báscula (COM2)"
   - Verificar que el estado muestre "Conectado"

2. **Leer Peso**
   - Colocar objeto en báscula
   - Click en "Leer Peso"
   - El peso aparecerá en pantalla

3. **Modo Offline**
   - La app funciona sin internet
   - Los datos se guardan localmente
   - Se sincronizan automáticamente al reconectar

---

## 📁 Estructura de Archivos Importante

```
gravio-electron/
├── .env.local           ← CREAR ESTE ARCHIVO
├── electron/            ← Código de Electron (backend)
├── src/                 ← Código de React (frontend)
│   ├── components/      ← Componentes UI
│   ├── lib/            ← Lógica de negocio
│   └── App.tsx         ← Entry point
├── README.md           ← Documentación completa
├── INSTALLATION.md     ← Guía detallada
└── package.json        ← Dependencias y scripts
```

---

## 🛠️ Scripts Útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build:electron

# Verificar tipos TypeScript
npm run type-check

# Linter
npm run lint
```

---

## 🐛 Problemas Comunes

### ❌ "No se encuentra el puerto COM2"
✅ Verificar que la báscula está conectada y encendida

### ❌ "Failed to connect to Supabase"
✅ Verificar credenciales en `.env.local`

### ❌ "Base de datos bloqueada"
✅ Cerrar todas las instancias de la app y reiniciar

---

## 📚 Más Información

- **README.md** - Documentación completa del proyecto
- **INSTALLATION.md** - Guía paso a paso detallada
- **SETUP_COMPLETE.md** - Resumen de lo instalado

---

## 🎯 Características Principales

✅ **Offline-First** - Funciona sin internet  
✅ **Sincronización Automática** - Cada 5 minutos  
✅ **Lectura de Báscula** - Mettler Toledo vía Serial  
✅ **Base de Datos Local** - SQLite  
✅ **Cloud Backup** - Supabase PostgreSQL  
✅ **UI Moderna** - shadcn/ui + Tailwind CSS  

---

**¿Listo para empezar?** 🚀

```bash
npm run dev
```
