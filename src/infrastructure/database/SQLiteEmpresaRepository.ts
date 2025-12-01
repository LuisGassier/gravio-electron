import type { Result } from '../../domain/shared/Result';
import { ResultFactory } from '../../domain/shared/Result';
import { Empresa } from '../../domain/entities/Empresa';
import type { IEmpresaRepository } from '../../domain/repositories/IEmpresaRepository';

/**
 * Repositorio SQLite para Empresa
 * Implementa persistencia local offline-first
 */
export class SQLiteEmpresaRepository implements IEmpresaRepository {
  async save(empresa: Empresa): Promise<Result<Empresa>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'));
      }

      await window.electron.db.run(
        `INSERT OR REPLACE INTO empresa 
         (id, empresa, clave_empresa, prefijo) 
         VALUES (?, ?, ?, ?)`,
        [empresa.id, empresa.empresa, empresa.claveEmpresa, empresa.prefijo]
      );

      return ResultFactory.ok(empresa);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async update(empresa: Empresa): Promise<Result<Empresa>> {
    return this.save(empresa);
  }

  async findById(id: string): Promise<Result<Empresa | null>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'));
      }

      const row = await window.electron.db.get(
        'SELECT * FROM empresa WHERE id = ?',
        [id]
      );

      if (!row) {
        return ResultFactory.ok(null);
      }

      return this.mapRowToEmpresa(row);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async findByClave(claveEmpresa: number): Promise<Result<Empresa | null>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'));
      }

      const row = await window.electron.db.get(
        'SELECT * FROM empresa WHERE clave_empresa = ?',
        [claveEmpresa]
      );

      if (!row) {
        return ResultFactory.ok(null);
      }

      return this.mapRowToEmpresa(row);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async findByPrefijo(prefijo: string): Promise<Result<Empresa | null>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'));
      }

      const row = await window.electron.db.get(
        'SELECT * FROM empresa WHERE prefijo = ?',
        [prefijo]
      );

      if (!row) {
        return ResultFactory.ok(null);
      }

      return this.mapRowToEmpresa(row);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async findAll(): Promise<Result<Empresa[]>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'));
      }

      const rows = await window.electron.db.all(
        'SELECT * FROM empresa ORDER BY empresa',
        []
      );

      const empresas: Empresa[] = [];
      for (const row of rows) {
        const result = this.mapRowToEmpresa(row);
        if (result.success && result.value) {
          empresas.push(result.value);
        }
      }

      return ResultFactory.ok(empresas);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'));
      }

      await window.electron.db.run('DELETE FROM empresa WHERE id = ?', [id]);

      return ResultFactory.ok(undefined);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  private mapRowToEmpresa(row: any): Result<Empresa> {
    return Empresa.create({
      id: row.id,
      empresa: row.empresa,
      claveEmpresa: row.clave_empresa,
      prefijo: row.prefijo,
    });
  }
}
