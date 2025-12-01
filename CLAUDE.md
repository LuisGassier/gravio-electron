# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Instructions for Claude

usa clean architecture principles when refactoring or adding new features. Follow the established patterns for IPC communication, offline-first data sync, and hardware integration. Ensure type safety with TypeScript and maintain separation of concerns between Electron main/preload and React renderer processes.

When implementing new features, consider the domain layer, use cases, and repository interfaces. Avoid direct database or hardware access from UI components; instead, use the `window.electron` API.

## Project Overview

**Gravio** is an Electron desktop application for Windows that manages sanitary landfill operations with offline-first capabilities. The system integrates with hardware (Mettler Toledo scale, Epson thermal printer) and synchronizes data between SQLite (local) and Supabase (cloud).

**Tech Stack**: Electron + React + TypeScript + Vite + SQLite + Supabase + shadcn

## Development Commands

```bash
# Development
npm run dev              # Start Vite dev server (localhost:5173) + Electron
npm run type-check       # TypeScript validation without emit

# Production Build
npm run build            # Build React app + compile TypeScript
npm run build:electron   # Full production build → dist-builder/Gravio-Setup.exe

# Code Quality
npm run lint             # Run ESLint
npm run preview          # Preview production build

# Post-install
npm run postinstall      # Rebuild native modules (serialport, better-sqlite3)
```

**Important**: After installing dependencies or updating `better-sqlite3` or `serialport`, run `npm run postinstall` to rebuild native modules for Electron.

## Architecture

### Process Model

**Electron Main Process** ([electron/main.ts](electron/main.ts))
- IPC handlers for hardware, database, and storage
- SQLite database initialization and management
- Serial port communication with scale
- Window management and security (CSP headers)

**Electron Preload** ([electron/preload.ts](electron/preload.ts))
- Context bridge exposing `window.electron` API to renderer
- Type-safe IPC communication between main and renderer

**React Renderer** ([src/](src/))
- UI components and application logic
- Offline-first data management
- Supabase authentication and sync coordination

### Data Flow

```
Hardware (Scale/Printer)
  ↓ (Serial/USB)
Main Process (IPC Handlers)
  ↓ (window.electron API)
Renderer Process (React)
  ↓
SQLite Local DB (electron/database.ts)
  ↓ (Sync Queue)
Supabase Cloud DB (src/lib/sync.ts)
```

## Key Architectural Patterns

### IPC Communication Pattern

All IPC channels follow the `namespace:action` convention:
- `serial:open`, `serial:close`, `serial:read`, `serial:list`
- `db:query`, `db:exec`, `db:transaction`
- `sync:start`, `sync:stop`, `sync:getStatus`
- `storage:get`, `storage:set`, `storage:delete`
- `printer:list`, `printer:print`
- `app:getVersion`, `app:getPlatform`

Example usage in renderer:
```typescript
await window.electron.serialPort.open('COM2', 2400)
const results = await window.electron.db.query('SELECT * FROM registros WHERE id = ?', [id])
```

### Offline-First Synchronization

**SQLite Schema** ([electron/database.ts](electron/database.ts))
- Core tables: `registros`, `vehiculos`, `operadores`, `rutas`, `empresa`, `conceptos`, `usuarios`, `roles`
- Sync tables: `sync_queue`, `sync_metadata`
- Junction tables: `operadores_empresas`, `conceptos_empresas`
- `sincronizado` field (0/1) tracks sync status for each record

**Sync Logic** ([src/lib/sync.ts](src/lib/sync.ts))
- Queue-based: Local changes marked with `sincronizado = 0`
- Auto-sync every 5 minutes when online
- Manual sync via `syncNow()`
- Conflict resolution: Last-write-wins
- Timestamp conversion: Unix seconds (SQLite) ↔ ISO strings (Supabase) via `unixToISO()`

**Foreign Keys**: Disabled (`PRAGMA foreign_keys = OFF`) to allow offline operation without referential integrity constraints. Data can be created locally without all related entities being present.

### Database Important Details

**Timestamp Handling**:
- SQLite uses Unix timestamps (INTEGER, seconds since epoch)
- Supabase uses PostgreSQL timestamptz (ISO 8601 strings)
- Conversion function `unixToISO()` in [src/lib/sync.ts](src/lib/sync.ts:89) handles mapping

**Field Type Mapping**:
- SQLite `INTEGER` boolean (0/1) → Supabase `boolean` (true/false)
- SQLite `REAL` → Supabase `numeric`/`float`
- All `id` fields use TEXT (UUIDs)

**Parameter Sanitization**:
- [electron/database.ts](electron/database.ts:221) `sanitizeParams()` converts JavaScript types to SQLite-compatible values
- Undefined → null, Objects/Arrays → JSON strings, booleans → 0/1

## Hardware Integration

### Mettler Toledo Scale

**Connection**: COM2 port, 2400 baud, 8 data bits, no parity, 1 stop bit (8N1)

**Data Format**: `)0 1050 0500` → parsed as 1050.0500 kg

**Implementation**: [electron/serialport.ts](electron/serialport.ts)

**Usage**:
```typescript
await window.electron.serialPort.open('COM2', 2400)
window.electron.serialPort.onData((weight: string) => {
  // Handle weight reading
})
```

### Epson Thermal Printer

**Model**: TM-T88V or similar (80mm, 203 DPI)

**Status**: ⚠️ **NOT IMPLEMENTED** - Placeholder exists in [electron/main.ts](electron/main.ts:142-150)

**TODO**: Implement thermal printing handlers for receipts and reports

## Clean Architecture Guidelines

The codebase is transitioning toward Clean Architecture as documented in [.github/copilot-instructions.md](.github/copilot-instructions.md):

**Target Structure**:
```
src/
├── domain/           # Business entities, use cases, repository interfaces
│   ├── entities/     # Registro, Vehiculo, Usuario (with validation)
│   ├── repositories/ # IRegistroRepository, IVehiculoRepository
│   └── use-cases/    # CreateRegistro, SyncRegistros, ReadWeight
├── infrastructure/   # External dependencies
│   ├── database/     # SQLiteRegistroRepository, SupabaseRegistroRepository
│   ├── hardware/     # MettlerToledoScale, EpsonPrinter
│   └── electron/     # ElectronBridge
├── application/      # Application services and mappers
│   ├── services/     # SyncService, AuthService
│   └── mappers/      # Entity ↔ DTO conversion
└── presentation/     # UI components, hooks, state (React)
```

**SOLID Principles**:
- **SRP**: One responsibility per class/module
- **OCP**: Extend via interfaces (e.g., `IWeightReader`)
- **LSP**: Interchangeable implementations (offline/online repos)
- **ISP**: Specific interfaces (prefer `IReadable` + `IWritable` over `IRepository`)
- **DIP**: Depend on abstractions, not concretions

**Patterns to Use**:
- **Repository**: Abstract data persistence ([domain/repositories/](domain/repositories/))
- **Factory**: Create implementations based on config
- **Result/Either**: Error handling without exceptions (`Result<T> = {success: true, value: T} | {success: false, error: Error}`)
- **Observer**: Domain events for cross-cutting concerns

**When Refactoring**:
1. Extract domain logic from components into entities
2. Define repository interfaces before implementations
3. Create one use case per user action
4. Move external dependencies behind interfaces
5. Refactor incrementally, verify each step
6. Keep old code until new code is validated

## TypeScript Configuration

**Path Alias**: `@/` maps to `src/` directory (configured in [vite.config.ts](vite.config.ts:42-44))

**Example**: `import { supabase } from '@/lib/supabase'`

**Type Definitions**:
- Global types in [src/vite-env.d.ts](src/vite-env.d.ts)
- `window.electron` API fully typed
- Environment variables typed via `ImportMetaEnv`

**External Modules**: `serialport`, `better-sqlite3`, `@serialport/parser-readline` are external in Vite build (see [vite.config.ts](vite.config.ts:16))

## Authentication & Security

**Supabase Authentication** ([src/lib/supabase.ts](src/lib/supabase.ts))
- Custom RPC: `authenticate_user(email, pin?, password?)`
- Row Level Security (RLS) enabled on all tables
- Session restored on app startup via `restoreSession()`

**Local Security**:
- Context isolation enabled in Electron
- Sandbox disabled (required for native modules)
- CSP headers enforce strict content policy

**Environment Variables** (`.env.local`):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_COM_PORT=COM2              # Optional, defaults in code
VITE_COM_BAUDRATE=2400          # Optional
```

## UI Framework

**shadcn/ui** components with Tailwind CSS
- Components in [src/components/ui/](src/components/ui/)
- `cn()` utility for class merging in [src/lib/utils.ts](src/lib/utils.ts)
- Radix UI primitives + Class Variance Authority (CVA)

**State Management**:
- Zustand for global state (installed but usage TBD)
- React Query for data synchronization (installed but usage TBD)

## Debugging Tips

**Serial Port Issues**:
```typescript
// List available ports
const ports = await window.electron.serialPort.list()
console.log('Available ports:', ports)
```

**Database Inspection**:
- DB file location: `%APPDATA%/gravio-electron/gravio.db` (Windows)
- Use [DB Browser for SQLite](https://sqlitebrowser.org/) to inspect
- WAL mode enabled for better concurrency

**Sync Status**:
```typescript
import { getSyncStatus, onSyncStatusChange } from '@/lib/sync'

// Get current status
const status = getSyncStatus()

// Subscribe to changes
onSyncStatusChange((status) => {
  console.log('Sync status:', status)
})
```

**Check Pending Items**:
```sql
SELECT COUNT(*) FROM registros WHERE sincronizado = 0;
SELECT * FROM sync_queue;
```

## Known TODOs

1. **Printer Implementation**: Thermal printer handlers not implemented ([electron/main.ts](electron/main.ts:142-150))
2. **Manual Conflict Resolution**: Currently uses last-write-wins; consider manual resolution UI
3. **Tests**: No test suite currently exists
4. **Error Boundaries**: Add React error boundaries for better error handling
5. **Sync Conflict UI**: Visual indication when conflicts occur

## Common Development Patterns

**Adding a New Table**:
1. Update [electron/database.ts](electron/database.ts) `createTables()` function
2. Add corresponding Supabase table with matching schema
3. Update sync logic in [src/lib/sync.ts](src/lib/sync.ts) to include new table
4. Add TypeScript types to [src/vite-env.d.ts](src/vite-env.d.ts) if needed

**Creating an IPC Handler**:
1. Add handler in [electron/main.ts](electron/main.ts) `registerIpcHandlers()`
2. Expose in [electron/preload.ts](electron/preload.ts) via `contextBridge`
3. Add type definition in [src/vite-env.d.ts](src/vite-env.d.ts) `ElectronAPI`
4. Use in renderer: `await window.electron.yourNamespace.yourAction()`

**Adding Environment Variables**:
1. Add to `.env.local` with `VITE_` prefix
2. Add type to `ImportMetaEnv` in [src/vite-env.d.ts](src/vite-env.d.ts)
3. Access via `import.meta.env.VITE_YOUR_VAR`

## Build & Distribution

**Output Directories**:
- `dist/`: Vite build output (React app)
- `dist-electron/`: Compiled Electron main/preload
- `dist-builder/`: Final installer (Gravio-Setup.exe)

**Electron Builder Config** ([package.json](package.json:18-40)):
- App ID: `com.gravio.sanitario`
- Product Name: `Gravio`
- Target: NSIS installer for Windows
- User can choose installation directory

**Native Modules**:
- `better-sqlite3` and `serialport` require rebuild after npm install
- Handled automatically via `postinstall` script
