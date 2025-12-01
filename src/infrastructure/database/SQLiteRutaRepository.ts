import type { Result } from '../../domain/shared/Result';
import { ResultFactory } from '../../domain/shared/Result';
import { Ruta } from '../../domain/entities/Ruta';
import type { IRutaRepository } from '../../domain/repositories/IRutaRepository';

/**
 * Repositorio SQLite para Ruta
 * Implementa persistencia local offline-first
 */
export class SQLiteRutaRepository implements IRutaRepository {
  async save(ruta: Ruta): Promise<Result<Ruta>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'));
      }

      await window.electron.db.run(
        `INSERT OR REPLACE INTO rutas 
         (id, ruta, clave_ruta, clave_empresa) 
         VALUES (?, ?, ?, ?)`,
        [ruta.id, ruta.ruta, ruta.claveRuta, ruta.claveEmpresa]
      );

      return ResultFactory.ok(ruta);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async update(ruta: Ruta): Promise<Result<Ruta>> {
    return this.save(ruta);
  }

  async findById(id: number): Promise<Result<Ruta | null>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'));
      }

      const row = await window.electron.db.get(
        'SELECT * FROM rutas WHERE id = ?',
        [id]
      );

      if (!row) {
        return ResultFactory.ok(null);
      }

      return this.mapRowToRuta(row);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async findByClave(claveRuta: number): Promise<Result<Ruta | null>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'));
      }

      const row = await window.electron.db.get(
        'SELECT * FROM rutas WHERE clave_ruta = ?',
        [claveRuta]
      );

      if (!row) {
        return ResultFactory.ok(null);
      }

      return this.mapRowToRuta(row);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async findByEmpresa(claveEmpresa: number): Promise<Result<Ruta[]>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'));
      }

      const rows = await window.electron.db.all(
        'SELECT * FROM rutas WHERE clave_empresa = ? ORDER BY ruta',
        [claveEmpresa]
      );

      const rutas: Ruta[] = [];
      for (const row of rows) {
        const result = this.mapRowToRuta(row);
        if (result.success && result.value) {
          rutas.push(result.value);
        }
      }

      return ResultFactory.ok(rutas);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async findAll(): Promise<Result<Ruta[]>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'));
      }

      const rows = await window.electron.db.all(
        'SELECT * FROM rutas ORDER BY ruta',
        []
      );

      const rutas: Ruta[] = [];
      for (const row of rows) {
        const result = this.mapRowToRuta(row);
        if (result.success && result.value) {
          rutas.push(result.value);
        }
      }

      return ResultFactory.ok(rutas);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async delete(id: number): Promise<Result<void>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'));
      }

      await window.electron.db.run('DELETE FROM rutas WHERE id = ?', [id]);

      return ResultFactory.ok(undefined);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  private mapRowToRuta(row: any): Result<Ruta> {
    return Ruta.create({
      id: row.id,
      ruta: row.ruta,
      claveRuta: row.clave_ruta,
      claveEmpresa: row.clave_empresa,
    });
  }
}
