# 📊 Configuración de Base de Datos

Por favor comparte la estructura de tus tablas de Supabase para que pueda adaptar el proyecto.

## Información Necesaria

1. **Nombres de las tablas** que tienes en Supabase
2. **Estructura de cada tabla** (columnas, tipos de datos, constraints)
3. **Relaciones entre tablas** (foreign keys)

## Formato Esperado

Puedes compartirlo en cualquiera de estos formatos:

### Opción 1: SQL Schema
```sql
CREATE TABLE nombre_tabla (
  id UUID PRIMARY KEY,
  campo1 TEXT,
  campo2 INTEGER,
  ...
);
```

### Opción 2: Descripción de tabla
```
Tabla: nombre_tabla
- id: UUID (Primary Key)
- campo1: TEXT
- campo2: INTEGER
- ...
```

### Opción 3: Screenshot del Schema en Supabase
Ve a Table Editor en Supabase y comparte screenshot de cada tabla.

---

## ⚠️ Nota Importante

Una vez que compartas la estructura:
- **NO se modificarán** las tablas de Supabase
- Solo se adaptará el código local (SQLite) para que coincida
- La sincronización respetará tu estructura existente
- Solo se harán **lecturas** de Supabase, no escrituras directas

## 🔍 Información Actual

Actualmente el proyecto tiene estas tablas locales (SQLite):
- `transactions`: Transacciones de pesaje
- `vehicles`: Vehículos registrados  
- `users`: Usuarios (cache)
- `sync_queue`: Cola de sincronización
- `sync_metadata`: Metadata de sync

¿Coinciden con tu Supabase o necesitas una estructura diferente?
