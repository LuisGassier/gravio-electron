import type { Result } from '../../domain/shared/Result';
import { ResultFactory } from '../../domain/shared/Result';
import { Operador } from '../../domain/entities/Operador';
import type { IOperadorRepository } from '../../domain/repositories/IOperadorRepository';

/**
 * Repositorio SQLite para Operador
 * Implementa persistencia local offline-first
 */
export class SQLiteOperadorRepository implements IOperadorRepository {
  async save(operador: Operador): Promise<Result<Operador>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'));
      }

      await window.electron.db.run(
        `INSERT OR REPLACE INTO operadores 
         (id, operador, clave_operador, created_at) 
         VALUES (?, ?, ?, ?)`,
        [
          operador.id,
          operador.operador,
          operador.claveOperador,
          operador.createdAt.getTime(),
        ]
      );

      return ResultFactory.ok(operador);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async update(operador: Operador): Promise<Result<Operador>> {
    return this.save(operador); // SQLite usa INSERT OR REPLACE
  }

  async findByEmpresa(claveEmpresa: number): Promise<Result<Operador[]>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'));
      }

      const rows = await window.electron.db.all(
        `SELECT DISTINCT o.* FROM operadores o
         INNER JOIN operadores_empresas oe ON o.id = oe.operador_id
         WHERE oe.clave_empresa = ?
         ORDER BY o.operador`,
        [claveEmpresa]
      );

      const operadores: Operador[] = [];
      for (const row of rows) {
        const result = this.mapRowToOperador(row);
        if (result.success && result.value) {
          operadores.push(result.value);
        }
      }

      return ResultFactory.ok(operadores);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async findById(id: string): Promise<Result<Operador | null>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'));
      }

      const row = await window.electron.db.get(
        'SELECT * FROM operadores WHERE id = ?',
        [id]
      );

      if (!row) {
        return ResultFactory.ok(null);
      }

      return this.mapRowToOperador(row);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async findByClave(claveOperador: number): Promise<Result<Operador | null>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'));
      }

      const row = await window.electron.db.get(
        'SELECT * FROM operadores WHERE clave_operador = ?',
        [claveOperador]
      );

      if (!row) {
        return ResultFactory.ok(null);
      }

      return this.mapRowToOperador(row);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async findAll(): Promise<Result<Operador[]>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'));
      }

      const rows = await window.electron.db.all(
        'SELECT * FROM operadores ORDER BY operador',
        []
      );

      const operadores: Operador[] = [];
      for (const row of rows) {
        const result = this.mapRowToOperador(row);
        if (result.success && result.value) {
          operadores.push(result.value);
        }
      }

      return ResultFactory.ok(operadores);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'));
      }

      await window.electron.db.run('DELETE FROM operadores WHERE id = ?', [id]);

      return ResultFactory.ok(undefined);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  private mapRowToOperador(row: any): Result<Operador> {
    return Operador.create({
      id: row.id,
      operador: row.operador,
      claveOperador: row.clave_operador,
      createdAt: new Date(row.created_at),
    });
  }
}
