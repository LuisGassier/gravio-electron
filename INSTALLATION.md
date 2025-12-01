# Instalación y Configuración de Gravio

## 📋 Guía Rápida de Instalación

### 1. Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js 18+** - [Descargar aquí](https://nodejs.org/)
- **npm** (viene con Node.js)
- **Git** - [Descargar aquí](https://git-scm.com/)

### 2. Clonar el Repositorio

```bash
git clone https://github.com/tuusuario/gravio-electron.git
cd gravio-electron
```

### 3. Instalar Dependencias

```bash
npm install
```

Esto instalará todas las dependencias necesarias:
- React 19 + TypeScript
- Electron 39
- Supabase Client
- Better-SQLite3 (almacenamiento offline)
- SerialPort (comunicación con báscula)
- shadcn/ui (componentes UI)
- Y más...

### 4. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Supabase (obtener de tu proyecto en supabase.com)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-api-key-anon

# Hardware
VITE_COM_PORT=COM2
VITE_COM_BAUDRATE=2400
```

### 5. Configurar Base de Datos en Supabase

#### Crear las tablas en Supabase:

1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Abre el SQL Editor
3. Ejecuta el siguiente SQL:

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

-- Habilitar Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso (ajustar según necesidades)
CREATE POLICY "Permitir lectura a usuarios autenticados" 
  ON transactions FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Permitir inserción a usuarios autenticados" 
  ON transactions FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Permitir lectura de vehículos" 
  ON vehicles FOR SELECT 
  TO authenticated 
  USING (true);

-- Índices para mejor rendimiento
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp DESC);
CREATE INDEX idx_transactions_vehicle ON transactions(vehicle_plate);
CREATE INDEX idx_vehicles_plate ON vehicles(plate);
```

### 6. Ejecutar en Modo Desarrollo

```bash
npm run dev
```

Esto iniciará:
- Vite dev server en `http://localhost:5173`
- Electron con hot reload

La app se abrirá automáticamente en una ventana de Electron.

### 7. Construir para Producción

```bash
npm run build:electron
```

Esto generará un ejecutable en `dist-builder/` que puedes instalar en Windows.

---

## 🔌 Configuración de Hardware

### Báscula Mettler Toledo

1. **Conectar la báscula** al puerto COM2 del PC
2. **Configurar la báscula** con estos parámetros:
   - Velocidad: 2400 baud
   - Bits de datos: 8
   - Paridad: None
   - Bits de parada: 1

3. **Verificar en Windows**:
   - Abrir "Administrador de dispositivos"
   - Buscar en "Puertos (COM y LPT)"
   - Verificar que aparece la báscula en COM2

### Impresora Térmica Epson

1. **Conectar la impresora** (USB o Serial)
2. **Instalar drivers** de Epson si es necesario
3. **Configurar** como impresora predeterminada (opcional)

---

## 🚀 Uso de la Aplicación

### Primera Vez

1. **Iniciar la app** con `npm run dev`
2. **Conectar báscula** - Click en "Conectar Báscula (COM2)"
3. **Verificar conexión** - El indicador debe mostrar "Conectado"
4. **Leer peso** - Click en "Leer Peso" para obtener el valor actual

### Flujo de Trabajo Normal

1. Vehículo llega al relleno sanitario
2. Se posiciona sobre la báscula
3. Operador hace click en "Leer Peso"
4. Se registra la transacción automáticamente
5. Se imprime el recibo (si está configurado)
6. Datos se guardan localmente en SQLite
7. Cuando hay internet, se sincronizan a Supabase

### Modo Offline

- La app funciona **completamente offline**
- Los datos se guardan en SQLite local
- Cuando vuelve la conexión, se sincronizan automáticamente
- El indicador de estado muestra "Online" u "Offline"

---

## 🛠️ Troubleshooting

### Error: "No se encuentra el puerto COM2"

**Solución:**
1. Verificar que la báscula está encendida
2. Revisar conexión del cable serial
3. Comprobar en Administrador de Dispositivos de Windows
4. Si está en otro puerto, actualizar `.env.local`

### Error: "Base de datos bloqueada"

**Solución:**
1. Cerrar todas las instancias de la app
2. Eliminar archivo `gravio.db-wal` y `gravio.db-shm`
3. Reiniciar la app

### Error: "Failed to connect to Supabase"

**Solución:**
1. Verificar credenciales en `.env.local`
2. Comprobar conexión a internet
3. Verificar que el proyecto Supabase está activo

### La báscula devuelve valores incorrectos

**Solución:**
1. Verificar configuración de velocidad (2400 baud)
2. Revisar manual de la báscula Mettler Toledo
3. El formato esperado es: `)0 1050 0500`

---

## 📁 Estructura del Proyecto

```
gravio-electron/
├── electron/                 # Código de Electron (proceso principal)
│   ├── main.ts              # Entry point de Electron
│   ├── preload.ts           # Bridge seguro entre main y renderer
│   ├── database.ts          # Lógica de SQLite
│   └── serialport.ts        # Comunicación con báscula
│
├── src/                     # Código de React (renderer process)
│   ├── components/          # Componentes React
│   │   ├── ui/             # Componentes de shadcn
│   │   └── Dashboard.tsx   # Pantalla principal
│   │
│   ├── lib/                # Librerías y utilidades
│   │   ├── supabase.ts    # Cliente de Supabase
│   │   ├── sync.ts        # Lógica de sincronización
│   │   └── utils.ts       # Utilidades generales
│   │
│   ├── App.tsx            # Componente raíz
│   ├── main.tsx           # Entry point de React
│   └── index.css          # Estilos globales (Tailwind)
│
├── public/                 # Assets estáticos
├── components.json         # Configuración de shadcn
├── tailwind.config.ts     # Configuración de Tailwind
├── vite.config.ts         # Configuración de Vite
├── tsconfig.json          # Configuración de TypeScript
├── package.json           # Dependencias y scripts
├── .env.example           # Ejemplo de variables de entorno
└── README.md              # Documentación principal
```

---

## 🔐 Seguridad

- **Row Level Security (RLS)** habilitado en Supabase
- **Autenticación JWT** para todos los requests
- **Context Isolation** en Electron
- **No Node Integration** en renderer process
- **Datos sensibles** en variables de entorno (nunca en código)

---

## 📞 Soporte

Para reportar problemas o solicitar ayuda:
- **Email**: soporte@gravio.local
- **Issues**: GitHub Issues del proyecto

---

## 🎯 Próximos Pasos

1. [ ] Implementar impresión térmica
2. [ ] Agregar autenticación de usuarios
3. [ ] Dashboard de estadísticas avanzado
4. [ ] Exportación de reportes
5. [ ] Sistema de alertas
6. [ ] Aplicación móvil complementaria
