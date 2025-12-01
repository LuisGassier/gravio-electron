# 🔧 Corrección Requerida - Repositorios

## Estado Actual

✅ **Repositorios Creados** (8 archivos):
- SQLiteVehiculoRepository
- SupabaseVehiculoRepository  
- SQLiteOperadorRepository (✅ CORREGIDO)
- SupabaseOperadorRepository (⚠️ PARCIAL)
- SQLiteRutaRepository
- SupabaseRutaRepository
- SQLiteEmpresaRepository
- SupabaseEmpresaRepository

## ⚠️ Errores por Corregir

### 1. ResultFactory.fail() Requiere Error
**Patrón Incorrecto**:
```typescript
return ResultFactory.fail('mensaje');
```

**Patrón Correcto**:
```typescript
return ResultFactory.fail(new Error('mensaje'));
```

**Archivos afectados**: Todos los 8 repositorios

### 2. Nombres de Propiedades de Entidades

| Entidad | Propiedad Correcta | ❌ Error Común |
|---------|-------------------|---------------|
| Operador | `operador.operador` | `operador.nombre` |
| Ruta | `ruta.ruta` | `ruta.nombre` |
| Empresa | `empresa.nombre` | ✅ Correcto |

**Archivos afectados**:
- Operador repositories (mapRowToOperador)
- Ruta repositories (mapRowToRuta, save methods)

### 3. Métodos Faltantes en Interfaces

#### IVehiculoRepository
Faltantes:
```typescript
findByPlacas(placas: string): Promise<Result<Vehiculo | null>>;
findByNoEconomico(noEconomico: string): Promise<Result<Vehiculo | null>>;
update(vehiculo: Vehiculo): Promise<Result<Vehiculo>>;
```

Implementación sugerida:
```typescript
async findByPlacas(placas: string): Promise<Result<Vehiculo | null>> {
  // Similar a findById, cambiar WHERE id = ? por WHERE placas = ?
}

async findByNoEconomico(noEconomico: string): Promise<Result<Vehiculo | null>> {
  // Similar a findById, cambiar WHERE id = ? por WHERE no_economico = ?
}

async update(vehiculo: Vehiculo): Promise<Result<Vehiculo>> {
  return this.save(vehiculo); // save ya hace INSERT OR REPLACE / upsert
}
```

#### IOperadorRepository  
Faltante en:
- SQLiteOperadorRepository: ✅ AGREGADO
- SupabaseOperadorRepository: ⚠️ findByEmpresa faltante

```typescript
async findByEmpresa(claveEmpresa: number): Promise<Result<Operador[]>> {
  // Query con JOIN a operadores_empresas WHERE clave_empresa = ?
}
```

#### IRutaRepository & IEmpresaRepository
Faltante en todos:
```typescript
async update(entity: Entity): Promise<Result<Entity>> {
  return this.save(entity); // Usa INSERT OR REPLACE / upsert
}
```

## 🔄 Plan de Corrección Rápida

### Paso 1: Reemplazos Globales (Search & Replace en VS Code)

1. **ResultFactory.fail strings → Error objects**
   - Buscar: `ResultFactory.fail\('(.+?)'\)`
   - Reemplazar: `ResultFactory.fail(new Error('$1'))`
   - Archivos: `src/infrastructure/database/**Repository.ts`

2. **Operador.nombre → Operador.operador**
   - Buscar: `operador\.nombre`
   - Reemplazar: `operador.operador`  
   - Archivos: `*OperadorRepository.ts`

3. **Ruta.nombre → Ruta.ruta**
   - Buscar: `ruta\.nombre`
   - Reemplazar: `ruta.ruta`
   - Archivos: `*RutaRepository.ts`

4. **error.message sin Error wrapper**
   - Buscar: `ResultFactory.fail\(error\.message\)`
   - Reemplazar: `ResultFactory.fail(new Error(error.message))`

### Paso 2: Agregar Métodos Faltantes

#### Vehiculo Repositories
Copiar-pegar después de `findByPlaca`:
```typescript
async findByPlacas(placas: string): Promise<Result<Vehiculo | null>> {
  // ... mismo código que findByPlaca con nombre correcto
}

async findByNoEconomico(noEconomico: string): Promise<Result<Vehiculo | null>> {
  // ... mismo código que findById pero WHERE no_economico = ?
}

async update(vehiculo: Vehiculo): Promise<Result<Vehiculo>> {
  return this.save(vehiculo);
}
```

#### Operador - SupabaseOperadorRepository
Copiar de SQLite version (ya implementado):
```typescript
async findByEmpresa(claveEmpresa: number): Promise<Result<Operador[]>> {
  // SELECT con JOIN operadores_empresas
}
```

#### Ruta & Empresa Repositories
Agregar método simple:
```typescript
async update(entity: Ruta | Empresa): Promise<Result<Ruta | Empresa>> {
  return this.save(entity);
}
```

### Paso 3: Correcciones de Mapeo

**SQLite**: Cambiar timestamps
```typescript
// ❌ INCORRECTO
createdAt: row.created_at

// ✅ CORRECTO  
createdAt: new Date(row.created_at)
```

**Supabase**: Ya correcto con `new Date(row.created_at)`

## ✅ Checklist de Validación

Por cada archivo:
- [ ] `ResultFactory.fail()` usa `new Error()`
- [ ] Propiedades de entidad correctas (operador, ruta, nombre)
- [ ] Todos los métodos de interfaz implementados
- [ ] update() delegando a save()
- [ ] Conversión de timestamps correcta
- [ ] 0 errores TypeScript

## 🚀 Después de Corregir

1. Ejecutar `npm run type-check` para validar
2. Actualizar `MIGRATION_COMPLETE.md` con repositorios completos
3. Crear ejemplos de uso en la documentación
4. Marcar tarea 5 como completada

---

**Nota**: Los archivos están funcionales pero con errores de tipos. La app puede correr pero TypeScript compilation fallará hasta hacer las correcciones.
