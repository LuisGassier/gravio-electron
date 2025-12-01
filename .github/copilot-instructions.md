# Gravio - Sistema de Gestión de Relleno Sanitario

## Arquitectura

**Electron + React + TypeScript** con **offline-first**:
- **Main** (`electron/main.ts`): IPC handlers, hardware, SQLite
- **Preload** (`electron/preload.ts`): Context bridge → `window.electron`
- **Renderer** (`src/`): React + sincronización Supabase ↔ SQLite

**Flujo**: Hardware → Main (IPC) → Renderer → SQLite local → Sync Queue → Supabase

**Comandos**:
```bash
npm run dev              # Dev: Vite + Electron (puerto 5173)
npm run build:electron   # Producción → dist-builder/Gravio-Setup.exe
npm run type-check       # Validación de tipos
```
⚠️ Requiere `electron-rebuild` post-install para `serialport`, `better-sqlite3`.

## Hardware

**Báscula Mettler Toledo**: COM2 (2400 baud, 8N1), formato `)0 1050 0500` → 1050.0500 kg
```typescript
await window.electron.serialPort.open('COM2', 2400)
window.electron.serialPort.onData((weight) => { /* UI */ })
```
**Impresora Epson TM-T88V**: 80mm, 203 DPI - TODO: `electron/main.ts:146`

## Base de Datos

**SQLite** (`electron/database.ts`): `userData/gravio.db`, WAL mode
- Tablas: `registros`, `vehiculos`, `operadores`, `rutas`, `empresa`, `conceptos`, `usuarios`, `roles`
- Campo `sincronizado` (0/1) controla sync

**Sync** (`src/lib/sync.ts`): Queue-based, cada 5 min o manual
- Flujo: Local → `sincronizado=0` → `syncNow()` → Supabase → `sincronizado=1`
- Conflictos: Last-write-wins

**Auth**: Supabase RPC `authenticate_user(email, pin?, password?)` - RLS habilitado

## Convenciones

**IPC Pattern**: `namespace:action` (`serial:open`, `db:query`, `sync:start`)
**TypeScript**: Path alias `@/` → `src/`, tipos en `src/vite-env.d.ts`, nativos external en Vite
**UI**: shadcn/ui (Tailwind + CVA), `cn()` en `src/lib/utils.ts`

**TODOs**: Impresora sin implementar, sync conflicts manual, tests pendientes

**Env vars**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_COM_PORT` (opcional)

**Debug**: `window.electron.serialPort.list()`, DB Browser for SQLite → `gravio.db`

## Clean Architecture

**Capas**:
```
src/
├── domain/           # Entities + Use Cases (sin dependencias externas)
│   ├── entities/     # Registro, Vehiculo, Usuario
│   ├── repositories/ # Interfaces (IRegistroRepository)
│   └── use-cases/    # CreateRegistro, SyncRegistros, ReadWeight
├── infrastructure/   # Frameworks & Drivers
│   ├── database/     # SQLiteRegistroRepository, SupabaseRegistroRepository
│   ├── hardware/     # MettlerToledoScale, EpsonPrinter
│   └── electron/     # ElectronBridge
├── application/      # Interface Adapters
│   ├── services/     # SyncService, AuthService
│   └── mappers/      # RegistroMapper
└── presentation/     # UI (components, hooks, stores)
```

**SOLID**:
- **SRP**: Una responsabilidad por clase (separar UseCase, Repository, Service)
- **OCP**: Usar interfaces para extensión (IWeightReader → MettlerToledoScale | GenericScale)
- **LSP**: Implementaciones intercambiables (OfflineRepo | OnlineRepo)
- **ISP**: Interfaces específicas (IReadable, IWritable, ITransactional)
- **DIP**: Depender de abstracciones (UseCase recibe interfaces, no implementaciones)

**Patrones**:
- **Repository**: Abstracción de persistencia (`IRegistroRepository` → `SQLiteRegistroRepository`)
- **Factory**: Creación de objetos (`WeightReaderFactory.create('mettler')`)
- **Observer**: Eventos de dominio (`RegistroCreatedEvent` → `SyncOnRegistroCreated`)

**Mejores Prácticas**:
- **Errores**: Result/Either pattern (`Result<T> = {success, value} | {success, error}`)
- **Validación**: En entidades de dominio (`Registro.create()` retorna Result)
- **DI**: Contenedor simple o constructor injection
- **Testing**: Mocks de interfaces, Arrange-Act-Assert
- **Inmutabilidad**: `readonly`, retornar nuevos objetos en lugar de mutar

**Refactorización** (incremental):
1. Entidades de dominio → Extraer lógica de negocio
2. Interfaces de repositorios → Contratos primero
3. Use cases → Un caso de uso por acción
4. Aislar dependencias externas → Detrás de interfaces
5. Funcionalidad por funcionalidad, verificar en cada paso
6. Mantener old + new código hasta validar

**Checklist**:
- [ ] Entidades con lógica de negocio (no solo DTOs)
- [ ] Use cases dependen de interfaces
- [ ] Presentación sin lógica de negocio
- [ ] Repositorios solo persistencia
- [ ] Una responsabilidad por clase
- [ ] Testeable con mocks
- [ ] Sin dependencias circulares


