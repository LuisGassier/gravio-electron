import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

let db: Database.Database | null = null

// Ruta de la base de datos
const DB_PATH = path.join(app.getPath('userData'), 'gravio.db')

// Inicializar la base de datos
export function initDatabase() {
  try {
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

  // Tabla de transacciones (offline queue)
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      weight REAL NOT NULL,
      vehicle_plate TEXT,
      driver_name TEXT,
      waste_type TEXT,
      timestamp INTEGER NOT NULL,
      synced INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)

  // Tabla de vehículos (cache)
  db.exec(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      plate TEXT UNIQUE NOT NULL,
      type TEXT,
      owner TEXT,
      last_updated INTEGER
    )
  `)

  // Tabla de usuarios (cache)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT,
      role TEXT,
      last_updated INTEGER
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

  // Índices para mejor performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_transactions_synced ON transactions(synced);
    CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
    CREATE INDEX IF NOT EXISTS idx_sync_queue_table ON sync_queue(table_name);
  `)

  console.log('✅ Tablas de base de datos creadas')
}

// Ejecutar query
export function executeQuery(sql: string, params: any[] = []): any[] {
  if (!db) {
    throw new Error('Base de datos no inicializada')
  }

  try {
    const stmt = db.prepare(sql)
    
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return stmt.all(...params)
    } else {
      const result = stmt.run(...params)
      return [{ changes: result.changes, lastInsertRowid: result.lastInsertRowid }]
    }
  } catch (error) {
    console.error('❌ Error en query:', error)
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

  const transaction = db.transaction((queries) => {
    for (const query of queries) {
      const stmt = db!.prepare(query.sql)
      stmt.run(...(query.params || []))
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
