# Gravio - Sistema de Gestión de Relleno Sanitario

Aplicación de escritorio para Windows desarrollada con **Electron**, **React**, **TypeScript** y **Vite**. Sistema de gestión integral para rellenos sanitarios con capacidad offline-first y sincronización automática con **Supabase**.

## 📋 Características Principales

### 🔌 Integración de Hardware
- **Lectura de Báscula Mettler Toledo**: Comunicación serial por puerto COM (COM2) con velocidad 2400 baud
  - Formato de lectura: )0 1050 0500 (peso en unidades)
  - Captura automática de valores para registro de depósitos
- **Impresión Térmica Epson**: Soporte para impresoras térmicas Epson con generación de recibos

### 📡 Conectividad y Sincronización
- **Backend Supabase**: Base de datos en tiempo real y autenticación
- **Modo Offline-First**: Funcionamiento completo sin conexión a internet
  - Almacenamiento local de datos en IndexedDB/SQLite
  - Cola de sincronización automática
  - Resolución de conflictos inteligente
- **Sincronización en Segundo Plano**: Sync automático al restaurar conexión

### 📊 Funcionalidades de Gestión
- Registro de depósitos de residuos
- Seguimiento de carga de vehículos
- Historial de transacciones
- Reportes y estadísticas
- Gestión de usuarios y permisos
- Auditoría completa de operaciones

### 🖥️ Interfaz de Usuario
- Interfaz responsive y optimizada para pantalla táctil
- Modo oscuro/claro
- Acceso offline a información almacenada
- Indicador visual de estado de conexión

## 🛠️ Stack Tecnológico

```
Frontend:
├── React 18+
├── TypeScript
├── Vite (dev server & bundler)
├── React Router
├── TailwindCSS / CSS Modules
├── Zustand (state management)
└── React Query (data synchronization)

Backend:
├── Supabase (PostgreSQL + Auth + Realtime)
├── Supabase Storage (archivos)
└── Edge Functions (lógica personalizada)

Desktop:
├── Electron (main + renderer processes)
├── Node Serial Port (comunicación COM)
├── Thermal Printer (impresión térmica)
└── Indexed DB / Better SQLite3 (almacenamiento local)

DevOps:
├── ESLint + Prettier
├── TypeScript strict mode
└── GitHub Actions (CI/CD)
```

## 📦 Requisitos Previos

### Sistema
- Windows 10 o superior
- Node.js 18+ 
- npm o yarn

### Hardware
- Báscula Mettler Toledo conectada en puerto COM2 (2400, 8, 1, N)
- Impresora térmica Epson (serie RS-232 o USB) TM-T88V o similar

### Configuración de Supabase
- Proyecto Supabase activo
- Variables de entorno configuradas (URL y API key anon)

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tuusuario/gravio-electron.git
cd gravio-electron
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env.local` en la raíz del proyecto:

```env
# Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-api-key-anon

# Configuración de Hardware
COM_PORT=COM2
COM_BAUDRATE=2400
COM_PARITY=N

# Impresora
PRINTER_MODEL=EPSON_TM20
PRINTER_PORT=COM3
```

### 4. Desarrollo
```bash
# Dev server con Vite + Electron
npm run dev

# Solo Vite (para desarrollo web)
npm run vite:dev

# Build para Electron
npm run build
```

### 5. Construcción para Producción
```bash
npm run build:electron
```

Genera ejecutable `Gravio-Setup.exe` en carpeta `dist/`

## 🔧 Configuración

### Conexión Serial (Báscula)

Configuración de puerto COM para Mettler Toledo:
- **Puerto**: COM2 (configurable)
- **Velocidad**: 2400 baud
- **Bits de datos**: 8
- **Paridad**: None (N)
- **Bits de parada**: 1

**Formato de datos esperados**:
```
)0 1050 0500
 ^  ^   ^
 |  |   └─ Decimales (últimos 3 dígitos)
 |  └───── Enteros (peso en kg)
 └──────── Indicador de estabilidad
```

Ejemplo de lectura: 1050.0500 kg

### Impresora Térmica

Configuración de impresora Epson TM-20 o similar:
- Ancho de papel: 80mm
- Resolución: 203 DPI
- Conexión: Series RS-232 o USB

Soporte para:
- Recibos de depósito
- Etiquetas de seguimiento
- Reportes de cierre de turno

## 💾 Almacenamiento Local (Offline)

### Estructura de Datos Local

```
IndexedDB/SQLite:
├── transactions (depósitos, movimientos)
├── vehicles (vehículos registrados)
├── users (usuarios caché)
├── sync_queue (cola de sincronización)
└── sync_metadata (timestamps, hashes)
```

### Sincronización Automática

- **Sincronización iniciales**: Al iniciar la app
- **Sincronización periódica**: Cada 5 minutos si hay conexión
- **Sincronización manual**: Botón de sincronización manual en UI
- **Conflictos**: Last-write-wins o solicitud manual de resolución

## 🔐 Seguridad

- Autenticación via Supabase (JWT tokens)
- Row Level Security (RLS) en base de datos
- Cifrado de datos sensibles en almacenamiento local
- Validación de entrada en cliente y servidor
- Auditoría de todas las operaciones

## 📱 API de Hardware

### Lectura de Báscula
```typescript
import { SerialReader } from './services/hardware/scale'

const scale = new SerialReader('COM2', 2400)
const weight = await scale.readWeight() // Returns: number (kg)
```

### Impresión Térmica
```typescript
import { ThermalPrinter } from './services/hardware/printer'

const printer = new ThermalPrinter('EPSON_TM20')
await printer.printReceipt({
  transactionId: '123',
  weight: 1050.05,
  date: new Date()
})
```

## 📚 Estructura del Proyecto

```
gravio-electron/
├── src/
│   ├── components/        # Componentes React
│   ├── pages/            # Páginas principales
│   ├── services/         # Lógica de negocio
│   │   ├── supabase/     # Cliente Supabase
│   │   ├── hardware/     # Integración COM, impresora
│   │   ├── sync/        # Sincronización offline
│   │   └── storage/     # IndexedDB / SQLite
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript interfaces
│   ├── utils/            # Funciones auxiliares
│   ├── styles/           # CSS global
│   ├── main.tsx         # Entry point React
│   └── App.tsx          # Componente raíz
├── electron/
│   ├── main.ts          # Proceso principal Electron
│   ├── preload.ts       # Bridge seguro IPC
│   └── handlers/        # Handlers de eventos
├── public/              # Assets estáticos
├── dist/                # Build output
├── package.json
├── vite.config.ts
├── tsconfig.json
├── electron.vite.config.ts (si aplica)
└── README.md
```

## 🔄 Flujo de Sincronización

```
┌─────────────────────────────────────┐
│   Usuario captura lectura báscula   │
└──────────────┬──────────────────────┘
               │
        ┌──────▼──────┐
        │ ¿Conexión?  │
        └──────┬──────┘
         ┌────┴────┐
    SÍ   │         │   NO
    ┌────▼───┐  ┌──▼────────────┐
    │Supabase│  │ IndexedDB/SQLite
    └────┬───┘  └──┬─────────────┘
         │         │
    ┌────▼─────────▼────┐
    │  Sincronización   │
    │  en background    │
    └───────┬───────────┘
            │
    ┌───────▼──────────┐
    │ Recepción confirmada
    └──────────────────┘
```

## 🧪 Desarrollo

### Scripts disponibles

```bash
npm run dev              # Iniciar dev server
npm run build            # Build para producción
npm run lint             # Ejecutar ESLint
npm run preview          # Vista previa de build
npm run build:electron   # Build ejecutable Electron
npm run type-check       # Verificar tipos TypeScript
```

### Convenciones de código

- **Componentes**: PascalCase
- **Funciones/variables**: camelCase
- **Constantes**: UPPER_SNAKE_CASE
- **Interfaz TypeScript**: IPascalCase
- **Ramas Git**: feature/descripcion, bugfix/descripcion

## 🐛 Troubleshooting

### Báscula no detectada
- Verificar puerto COM en administrador de dispositivos
- Confirmar velocidad 2400 baud en configuración Mettler Toledo
- Comprobar cables de conexión y alimentación

### Impresora no imprime
- Verificar que impresora está encendida y conectada
- Confirmar drivers Epson instalados
- Probar página de prueba desde propiedades de impresora

### Sincronización lenta
- Revisar conexión a internet
- Verificar volumen de datos en cola
- Considerar sincronización selectiva por fecha

### App no inicia
- Eliminar carpeta `node_modules` y carpeta de caché
- Reinstalar: `npm install`
- Verificar versión de Node.js: `node -v` (debe ser 18+)

## 📝 Licencia

Propietaria - Gravio 2025

## 👥 Soporte

Para reportar bugs o sugerencias:
- Email: soporte@gravio.local
- Issues: GitHub Issues del proyecto

## 🎯 Roadmap

- [ ] Dashboard estadístico mejorado
- [ ] Exportación a PDF/Excel de reportes
- [ ] Integración con GPS de vehículos
- [ ] Sistema de alertas y notificaciones
- [ ] Aplicación móvil complementaria (React Native)
- [ ] Multisede y sincronización distribuida
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
## Instrucciones para release con auto-update
```
npm run build:electron
```
```
subir release a GitHub con tag `vX.Y.Z`
subir .exe a assets del release y latest.yml
```
C:\Users\Luis Gassier\Documents\GitHub\gravio-electron\dist-builder
```