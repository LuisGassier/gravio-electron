// Importación dinámica para better-sqlite3
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

let Database: any
let db: any = null

// Ruta de la base de datos
let DB_PATH: string

// Cargar módulo de forma dinámica
async function loadDatabase() {
  if (!Database) {
    const dbModule = await import('better-sqlite3')
    Database = dbModule.default
    DB_PATH = path.join(app.getPath('userData'), 'gravio.db')
  }
}

// Inicializar la base de datos
export async function initDatabase() {
  try {
    // Cargar módulo primero
    await loadDatabase()
    
    // Asegurar que existe el directorio
    const dir = path.dirname(DB_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    db = new Database(DB_PATH, { verbose: console.log })
    db.pragma('journal_mode = WAL')
    
    // Crear tablas iniciales
    createTables()
    
    console.log('✅ Base de datos SQLite inicializada en:', DB_PATH)
    return db
  } catch (error) {
    console.error('❌ Error al inicializar base de datos:', error)
    throw error
  }
}

function createTables() {
  if (!db) return

  // Deshabilitar foreign keys temporalmente para evitar errores de orden
  db.pragma('foreign_keys = OFF')

  // Tabla de roles (sin foreign keys)
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      nombre TEXT UNIQUE NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)

  // Tabla de empresa (sin foreign keys, pero referenciada por otras)
  db.exec(`
    CREATE TABLE IF NOT EXISTS empresa (
      id TEXT PRIMARY KEY,
      empresa TEXT NOT NULL,
      clave_empresa INTEGER UNIQUE,
      prefijo TEXT NOT NULL
    )
  `)

  // Tabla de rutas (depende de empresa.clave_empresa)
  db.exec(`
    CREATE TABLE IF NOT EXISTS rutas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ruta TEXT NOT NULL,
      clave_ruta INTEGER UNIQUE,
      clave_empresa INTEGER
    )
  `)

  // Tabla de operadores (sin foreign keys, pero referenciada)
  db.exec(`
    CREATE TABLE IF NOT EXISTS operadores (
      id TEXT PRIMARY KEY,
      operador TEXT NOT NULL,
      clave_operador INTEGER UNIQUE NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)

  // Tabla de usuarios (depende de roles.id)
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      telefono TEXT,
      rol_id TEXT,
      activo INTEGER DEFAULT 1,
      password TEXT,
      password_hash TEXT,
      pin TEXT,
      pin_expires_at INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)

  // Tabla de vehículos (depende de empresa.clave_empresa)
  db.exec(`
    CREATE TABLE IF NOT EXISTS vehiculos (
      id TEXT PRIMARY KEY,
      no_economico TEXT NOT NULL,
      placas TEXT NOT NULL,
      clave_empresa INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)

  // Tabla de conceptos (sin foreign keys, pero referenciada)
  db.exec(`
    CREATE TABLE IF NOT EXISTS conceptos (
      id TEXT PRIMARY KEY,
      nombre TEXT UNIQUE NOT NULL,
      clave_concepto INTEGER,
      activo INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)

  // Tabla de registros (depende de rutas.clave_ruta y operadores.clave_operador)
  db.exec(`
    CREATE TABLE IF NOT EXISTS registros (
      id TEXT PRIMARY KEY,
      clave_ruta INTEGER,
      placa_vehiculo TEXT NOT NULL,
      numero_economico TEXT,
      clave_operador INTEGER,
      operador TEXT,
      ruta TEXT,
      peso REAL,
      peso_entrada REAL,
      peso_salida REAL,
      fecha_entrada INTEGER,
      fecha_salida INTEGER,
      fecha_registro INTEGER DEFAULT (strftime('%s', 'now')),
      tipo_pesaje TEXT DEFAULT 'entrada',
      folio TEXT,
      clave_concepto INTEGER,
      concepto_id TEXT,
      clave_empresa INTEGER,
      observaciones TEXT,
      sincronizado INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      registrado_por TEXT
    )
  `)

  // Migración: Agregar columna registrado_por si no existe
  try {
    const tableInfo = db.pragma('table_info(registros)')
    const hasRegistradoPor = tableInfo.some((col: any) => col.name === 'registrado_por')
    if (!hasRegistradoPor) {
      db.exec('ALTER TABLE registros ADD COLUMN registrado_por TEXT')
      console.log('✅ Columna registrado_por agregada a tabla registros')
    }
  } catch (error) {
    console.warn('⚠️ Error al verificar/agregar columna registrado_por:', error)
  }

  // Tabla de operadores-empresas (relación muchos-a-muchos)
  db.exec(`
    CREATE TABLE IF NOT EXISTS operadores_empresas (
      operador_id TEXT NOT NULL,
      clave_empresa INTEGER NOT NULL,
      PRIMARY KEY (operador_id, clave_empresa)
    )
  `)

  // Tabla de conceptos-empresas (relación muchos-a-muchos)
  db.exec(`
    CREATE TABLE IF NOT EXISTS conceptos_empresas (
      concepto_id TEXT NOT NULL,
      clave_empresa INTEGER NOT NULL,
      PRIMARY KEY (concepto_id, clave_empresa)
    )
  `)

  // Tabla de cola de sincronización
  db.exec(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      table_name TEXT NOT NULL,
      operation TEXT NOT NULL,
      data TEXT NOT NULL,
      attempts INTEGER DEFAULT 0,
      last_attempt INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)

  // Tabla de metadata de sincronización
  db.exec(`
    CREATE TABLE IF NOT EXISTS sync_metadata (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)

  // Tabla de secuencias de folios (para generación offline)
  db.exec(`
    CREATE TABLE IF NOT EXISTS folio_sequences (
      id TEXT PRIMARY KEY,
      clave_empresa INTEGER UNIQUE NOT NULL,
      prefijo_empresa TEXT NOT NULL,
      ultimo_numero INTEGER NOT NULL DEFAULT 0,
      sincronizado INTEGER DEFAULT 0,
      updated_at TEXT NOT NULL
    )
  `)

  // Índices para mejor performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_registros_sincronizado ON registros(sincronizado);
    CREATE INDEX IF NOT EXISTS idx_registros_fecha ON registros(fecha_registro);
    CREATE INDEX IF NOT EXISTS idx_registros_placa ON registros(placa_vehiculo);
    CREATE INDEX IF NOT EXISTS idx_registros_id ON registros(id);
    CREATE INDEX IF NOT EXISTS idx_registros_fecha_entrada ON registros(fecha_entrada);
    CREATE INDEX IF NOT EXISTS idx_registros_pending ON registros(peso_salida) WHERE peso_salida IS NULL;
    CREATE INDEX IF NOT EXISTS idx_registros_unsynced ON registros(sincronizado, updated_at) WHERE sincronizado = 0;
    CREATE INDEX IF NOT EXISTS idx_sync_queue_table ON sync_queue(table_name);
    CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
    CREATE INDEX IF NOT EXISTS idx_vehiculos_placas ON vehiculos(placas);
    CREATE INDEX IF NOT EXISTS idx_operadores_clave ON operadores(clave_operador);
    CREATE INDEX IF NOT EXISTS idx_rutas_clave ON rutas(clave_ruta);
    CREATE INDEX IF NOT EXISTS idx_empresa_clave ON empresa(clave_empresa);
    CREATE INDEX IF NOT EXISTS idx_conceptos_id ON conceptos(id);
  `)

  // Rehabilitar foreign keys (pero sin constraints estrictos para offline-first)
  // Las FKs son opcionales ya que en offline podemos tener datos sin referencias
  db.pragma('foreign_keys = OFF')

  console.log('✅ Tablas de base de datos creadas (estructura compatible con Supabase)')
  console.log('⚠️  Foreign keys deshabilitadas para operación offline-first')
}

// Sanitizar parámetros para SQLite
function sanitizeParams(params: any[]): any[] {
  return params.map(param => {
    // SQLite solo acepta: numbers, strings, bigints, buffers, y null
    if (param === undefined) return null
    if (param === null) return null
    if (typeof param === 'number') return param
    if (typeof param === 'string') return param
    if (typeof param === 'bigint') return param
    if (Buffer.isBuffer(param)) return param
    if (typeof param === 'boolean') return param ? 1 : 0
    
    // Objetos/Arrays → convertir a JSON string
    if (typeof param === 'object') {
      console.warn('⚠️ Convirtiendo objeto a JSON string:', param)
      return JSON.stringify(param)
    }
    
    // Fallback: convertir a string
    return String(param)
  })
}

// Ejecutar query
export function executeQuery(sql: string, params: any[] = []): any[] {
  if (!db) {
    throw new Error('Base de datos no inicializada')
  }

  try {
    // Sanitizar parámetros
    const sanitizedParams = sanitizeParams(params)
    
    const stmt = db.prepare(sql)
    
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return stmt.all(...sanitizedParams)
    } else {
      const result = stmt.run(...sanitizedParams)
      return [{ changes: result.changes, lastInsertRowid: result.lastInsertRowid }]
    }
  } catch (error) {
    console.error('❌ Error en query:', error)
    console.error('   SQL:', sql)
    console.error('   Params:', params)
    throw error
  }
}

// Ejecutar comando SQL sin retorno
export function executeCommand(sql: string): void {
  if (!db) {
    throw new Error('Base de datos no inicializada')
  }

  try {
    db.exec(sql)
  } catch (error) {
    console.error('❌ Error en comando SQL:', error)
    throw error
  }
}

// Ejecutar transacción
export function executeTransaction(queries: Array<{ sql: string; params?: any[] }>): void {
  if (!db) {
    throw new Error('Base de datos no inicializada')
  }

  const transaction = db.transaction((queries: Array<{ sql: string; params?: any[] }>) => {
    for (const query of queries) {
      const stmt = db!.prepare(query.sql)
      const sanitizedParams = sanitizeParams(query.params || [])
      stmt.run(...sanitizedParams)
    }
  })

  try {
    transaction(queries)
  } catch (error) {
    console.error('❌ Error en transacción:', error)
    throw error
  }
}

// Obtener transacciones no sincronizadas
export function getUnsyncedTransactions() {
  if (!db) return []
  
  const stmt = db.prepare('SELECT * FROM transactions WHERE synced = 0 ORDER BY timestamp ASC')
  return stmt.all()
}

// Marcar transacción como sincronizada
export function markTransactionSynced(id: string) {
  if (!db) return
  
  const stmt = db.prepare('UPDATE transactions SET synced = 1 WHERE id = ?')
  stmt.run(id)
}

// Agregar a cola de sincronización
export function addToSyncQueue(tableName: string, operation: string, data: any) {
  if (!db) return
  
  const id = `${tableName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const stmt = db.prepare(`
    INSERT INTO sync_queue (id, table_name, operation, data)
    VALUES (?, ?, ?, ?)
  `)
  
  stmt.run(id, tableName, operation, JSON.stringify(data))
  return id
}

// Obtener items de la cola de sincronización
export function getSyncQueue(limit = 50) {
  if (!db) return []
  
  const stmt = db.prepare(`
    SELECT * FROM sync_queue 
    WHERE attempts < 5 
    ORDER BY created_at ASC 
    LIMIT ?
  `)
  return stmt.all(limit)
}

// Eliminar de la cola de sincronización
export function removeFromSyncQueue(id: string) {
  if (!db) return
  
  const stmt = db.prepare('DELETE FROM sync_queue WHERE id = ?')
  stmt.run(id)
}

// Incrementar intentos de sincronización
export function incrementSyncAttempts(id: string) {
  if (!db) return
  
  const stmt = db.prepare(`
    UPDATE sync_queue 
    SET attempts = attempts + 1, last_attempt = strftime('%s', 'now') 
    WHERE id = ?
  `)
  stmt.run(id)
}

// Ejecutar query y obtener un solo resultado (get)
export function getOne(sql: string, params: any[] = []) {
  if (!db) throw new Error('Database not initialized')
  
  try {
    const stmt = db.prepare(sql)
    return stmt.get(...params)
  } catch (error) {
    console.error('❌ Error en getOne:', error)
    throw error
  }
}

// Ejecutar query y obtener todos los resultados (all)
export function getAll(sql: string, params: any[] = []) {
  if (!db) throw new Error('Database not initialized')
  
  try {
    const stmt = db.prepare(sql)
    return stmt.all(...params)
  } catch (error) {
    console.error('❌ Error en getAll:', error)
    throw error
  }
}

// Ejecutar comando sin resultado (run)
export function runCommand(sql: string, params: any[] = []) {
  if (!db) throw new Error('Database not initialized')
  
  try {
    const stmt = db.prepare(sql)
    return stmt.run(...params)
  } catch (error) {
    console.error('❌ Error en runCommand:', error)
    throw error
  }
}

// Cerrar conexión
export function closeDatabase() {
  if (db) {
    db.close()
    db = null
    console.log('✅ Base de datos cerrada')
  }
}

// Exportar la instancia
export function getDatabase() {
  return db
}
