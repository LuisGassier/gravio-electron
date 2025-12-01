# Sistema de Generación Offline de Folios - Implementación Completada

## 📋 Resumen

Se implementó un sistema robusto de generación de folios con estrategia **online-first, offline-fallback**, similar al sistema Flutter que proporcionaste como referencia.

## 🎯 Características Principales

### 1. **Estrategia de Generación Online-First**

El sistema intenta siempre generar folios consultando Supabase primero, y solo si falla o no hay conexión, cae al modo offline:

```
┌─────────────────────────────────────┐
│   getNextFolio(claveEmpresa)        │
└───────────┬─────────────────────────┘
            │
            ▼
    ┌───────────────┐
    │ NetworkService │ ── Verificar conexión
    └───────┬───────┘
            │
     ┌──────┴──────┐
     │   Online?   │
     └──────┬──────┘
            │
    ┌───────┴────────┐
    │                │
    ▼                ▼
┌─────────┐    ┌──────────┐
│ ONLINE  │    │ OFFLINE  │
└────┬────┘    └────┬─────┘
     │              │
     ▼              │
getNextFolioOnline  │
     │              │
 ┌───┴────┐         │
 │Success?│         │
 └───┬────┘         │
     │              │
  ┌──┴──┐           │
  │ Sí  │ No ────────┘
  └──┬──┘           │
     │              ▼
     │      getNextFolioOffline
     │              │
     └──────┬───────┘
            │
            ▼
    Folio Generado ✅
```

### 2. **Componentes Implementados**

#### **Entidad de Dominio: FolioSequence**
```typescript
src/domain/entities/FolioSequence.ts
```
- Encapsula lógica de negocio para secuencias de folios
- Validaciones: prefijo 4 letras mayúsculas, números no negativos
- Métodos: `increment()`, `getNextFolio()`, `markAsSynchronized()`, `updateFromRemote()`

#### **Repositorios**

**SQLiteFolioSequenceRepository** (Local)
```typescript
src/infrastructure/database/SQLiteFolioSequenceRepository.ts
```
- Persistencia offline en SQLite
- Consulta máximo folio de registros locales
- Tabla: `folio_sequences`

**SupabaseFolioSequenceRepository** (Remoto)
```typescript
src/infrastructure/database/SupabaseFolioSequenceRepository.ts
```
- Consulta Supabase cuando hay conexión
- Usa función existente `get_next_folio_number()`
- ⚠️ Tabla `folio_sequences` aún no existe en Supabase (migración pendiente)

#### **Servicios de Aplicación**

**FolioService** (Core)
```typescript
src/application/services/FolioService.ts
```

Métodos principales:
- `getNextFolio(claveEmpresa)` - Genera folio con fallback
- `getNextFolioOnline()` - Modo online (consulta Supabase)
- `getNextFolioOffline()` - Modo offline (solo SQLite)
- `initializeSequences()` - Inicializa al arrancar app
- `syncSequences()` - Sincroniza local ↔ remoto

**NetworkService** (Conectividad)
```typescript
src/application/services/NetworkService.ts
```
- Detecta si hay internet y Supabase disponible
- Caché de 30 segundos para evitar sobrecarga
- Timeout de 5 segundos en verificación
- Escucha eventos `online`/`offline` del navegador

#### **Integración en Flujo de Pesaje**

**PesajeService** actualizado:
```typescript
src/application/services/PesajeService.ts
```
```typescript
async registrarEntrada(input) {
  // 🎯 Generar folio offline usando FolioService
  const folioResult = await this.folioService.getNextFolio(input.claveEmpresa)
  
  if (folioResult.success) {
    folioGenerado = folioResult.value
    console.log(`📋 Folio generado: ${folioGenerado}`)
  } else {
    console.warn(`⚠️ No se pudo generar folio, Supabase lo generará al sincronizar`)
  }
  
  // Crear registro con folio (o undefined)
  await this.createEntradaUseCase.execute({
    ...input,
    pesoEntrada: pesoActual,
    folio: folioGenerado
  })
}
```

**SyncService** actualizado:
```typescript
src/application/services/SyncService.ts
```
- Sincroniza registros Y secuencias de folios
- Reporta `foliosSynced` en resultado

### 3. **Base de Datos**

#### **SQLite (Local)**

Tabla creada en `electron/database.ts`:
```sql
CREATE TABLE IF NOT EXISTS folio_sequences (
  id TEXT PRIMARY KEY,
  clave_empresa INTEGER UNIQUE NOT NULL,
  prefijo_empresa TEXT NOT NULL,
  ultimo_numero INTEGER NOT NULL DEFAULT 0,
  sincronizado INTEGER DEFAULT 0,
  updated_at TEXT NOT NULL
)
```

#### **Supabase (Remoto)**

Migración preparada pero **NO ejecutada**:
```
migrations/20251201_create_folio_sequences.sql
```

Incluye:
- Tabla `folio_sequences`
- Función `sync_folio_sequence_from_registros()`
- Trigger para `updated_at`
- Políticas RLS
- Índices optimizados

## 🔄 Flujo Completo

### Escenario 1: Usuario con Internet

1. Usuario registra entrada de camión
2. `FolioService.getNextFolio()` detecta conexión
3. Consulta `get_next_folio_number()` en Supabase → último folio: `GRAV-0000042`
4. Incrementa localmente: `GRAV-0000043`
5. Guarda en SQLite con `sincronizado=1`
6. Retorna folio al formulario
7. Registro se guarda con folio en SQLite
8. Al sincronizar, se sube a Supabase con folio ya asignado

### Escenario 2: Usuario sin Internet

1. Usuario registra entrada de camión
2. `FolioService.getNextFolio()` detecta sin conexión
3. Consulta tabla `folio_sequences` en SQLite local → `ultimo_numero=42`
4. Incrementa: `GRAV-0000043`
5. Guarda en SQLite con `sincronizado=0`
6. Retorna folio al formulario
7. Registro se guarda con folio en SQLite
8. Cuando vuelve internet, `syncSequences()` reconcilia:
   - Local: 43, Remoto: 40 → usa Math.max → 43
   - Evita duplicados

### Escenario 3: Error Online (Fallback)

1. Usuario tiene internet pero Supabase está lento/caído
2. `FolioService.getNextFolio()` detecta online
3. Intenta `getNextFolioOnline()` → timeout/error
4. Catch captura error, log: `🔄 Fallback a modo OFFLINE...`
5. Llama `getNextFolioOffline()` como respaldo
6. Genera folio desde SQLite local
7. Sistema sigue funcionando ✅

## 📦 Archivos Creados/Modificados

### Nuevos Archivos

```
src/domain/entities/FolioSequence.ts
src/domain/repositories/IFolioSequenceRepository.ts
src/infrastructure/database/SQLiteFolioSequenceRepository.ts
src/infrastructure/database/SupabaseFolioSequenceRepository.ts
src/application/services/FolioService.ts
src/application/services/NetworkService.ts
migrations/20251201_create_folio_sequences.sql
```

### Archivos Modificados

```
electron/database.ts - Agregada tabla folio_sequences
src/domain/use-cases/registro/CreateEntrada.ts - Campo folio opcional
src/application/services/PesajeService.ts - Generación de folio
src/application/services/SyncService.ts - Sync de secuencias
src/application/DIContainer.ts - Inyección de dependencias
src/domain/index.ts - Exports
src/infrastructure/index.ts - Exports
src/application/index.ts - Exports
```

## 🚀 Próximos Pasos

### 1. Probar Localmente

```bash
npm run dev
```

- Registrar entrada sin internet → debe generar folio offline
- Registrar entrada con internet → debe consultar Supabase
- Desconectar internet a mitad de operación → debe hacer fallback

### 2. Ejecutar Migración en Supabase (PENDIENTE)

**Opción A: Desde MCP de Supabase**
```typescript
await mcp_supabase_apply_migration({
  name: "create_folio_sequences",
  query: /* contenido de migrations/20251201_create_folio_sequences.sql */
})
```

**Opción B: Desde Supabase Dashboard**
- SQL Editor → Pegar contenido de migración → Run

**Opción C: Supabase CLI**
```bash
supabase migration new create_folio_sequences
# Copiar SQL
supabase db push
```

### 3. Inicializar Secuencias Existentes

Después de ejecutar la migración, sincronizar datos existentes:

```sql
-- Inicializar secuencias para todas las empresas
SELECT sync_folio_sequence_from_registros(clave_empresa) FROM empresa;
```

O desde la app, al arrancar por primera vez después de migración:
```typescript
await container.folioService.initializeSequences()
```

### 4. Monitoreo

Logs a observar:
- `🌐 Intentando generar folio ONLINE...`
- `✅ Folio generado ONLINE: XXXX-0000001`
- `📴 Sin conexión - Generando folio OFFLINE`
- `✅ Folio generado OFFLINE: XXXX-0000001`
- `🔄 Fallback a modo OFFLINE...`

## ⚠️ Consideraciones Importantes

1. **La tabla `folio_sequences` NO existe aún en Supabase**
   - `SupabaseFolioSequenceRepository` tiene stubs preparados
   - Solo `getMaxFolioNumberFromRegistros()` funciona (usa tabla `registros`)
   - Ejecutar migración cuando estés listo

2. **El trigger `generar_folio()` de Supabase sigue activo**
   - Si un registro llega sin folio, Supabase lo generará
   - Esto es un respaldo adicional, no un conflicto

3. **Sincronización usa `Math.max()`**
   - Previene retrocesos en numeración
   - Si local tiene 50 y remoto 45, usa 50
   - Evita duplicados

4. **NetworkService cachea por 30 segundos**
   - No sobrecarga red con checks constantes
   - Usa `navigator.onLine` como primer filtro
   - Timeout de 5 segundos para Supabase

## 🎓 Patrón Implementado

Este patrón se conoce como:
- **Resilient API Pattern** (APIs resilientes)
- **Fallback Strategy** (Estrategia de respaldo)
- **Offline-First with Online Sync** (Offline primero con sincronización online)

Ventajas:
✅ La app NUNCA se queda sin folios
✅ Funciona con o sin internet
✅ Se recupera automáticamente de errores de Supabase
✅ Sincronización transparente
✅ No duplica folios

## 📝 Comentario Final

El sistema está **listo para probar** localmente. La única acción pendiente es ejecutar la migración en Supabase cuando decidas hacerlo. Mientras tanto, el sistema funcionará en modo offline puro y seguirá usando el trigger de Supabase como respaldo para registros que lleguen sin folio.
