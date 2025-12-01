import type { Result } from '../../domain/shared/Result';
import { ResultFactory } from '../../domain/shared/Result';
import { Vehiculo } from '../../domain/entities/Vehiculo';
import type { IVehiculoRepository } from '../../domain/repositories/IVehiculoRepository';

/**
 * Repositorio SQLite para Vehiculo
 * Implementa persistencia local offline-first
 */
export class SQLiteVehiculoRepository implements IVehiculoRepository {
  async save(vehiculo: Vehiculo): Promise<Result<Vehiculo>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'));
      }

      await window.electron.db.run(
        `INSERT OR REPLACE INTO vehiculos 
         (id, no_economico, placas, clave_empresa, created_at) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          vehiculo.id,
          vehiculo.noEconomico,
          vehiculo.placas,
          vehiculo.claveEmpresa,
          vehiculo.createdAt.getTime(),
        ]
      );

      return ResultFactory.ok(vehiculo);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async update(vehiculo: Vehiculo): Promise<Result<Vehiculo>> {
    return this.save(vehiculo);
  }

  async findById(id: string): Promise<Result<Vehiculo | null>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'));
      }

      const row = await window.electron.db.get(
        'SELECT * FROM vehiculos WHERE id = ?',
        [id]
      );

      if (!row) {
        return ResultFactory.ok(null);
      }

      return this.mapRowToVehiculo(row);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async findByPlaca(placa: string): Promise<Result<Vehiculo | null>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'));
      }

      const row = await window.electron.db.get(
        'SELECT * FROM vehiculos WHERE placas = ?',
        [placa]
      );

      if (!row) {
        return ResultFactory.ok(null);
      }

      return this.mapRowToVehiculo(row);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async findByPlacas(placas: string[]): Promise<Result<Vehiculo[]>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'));
      }

      if (placas.length === 0) {
        return ResultFactory.ok([]);
      }

      const placeholders = placas.map(() => '?').join(',');
      const rows = await window.electron.db.all(
        `SELECT * FROM vehiculos WHERE placas IN (${placeholders})`,
        placas
      );

      const vehiculos: Vehiculo[] = [];
      for (const row of rows) {
        const result = this.mapRowToVehiculo(row);
        if (result.success && result.value) {
          vehiculos.push(result.value);
        }
      }

      return ResultFactory.ok(vehiculos);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async findByNoEconomico(noEconomico: string): Promise<Result<Vehiculo | null>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'));
      }

      const row = await window.electron.db.get(
        'SELECT * FROM vehiculos WHERE no_economico = ?',
        [noEconomico]
      );

      if (!row) {
        return ResultFactory.ok(null);
      }

      return this.mapRowToVehiculo(row);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async findByEmpresa(claveEmpresa: number): Promise<Result<Vehiculo[]>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'));
      }

      const rows = await window.electron.db.all(
        'SELECT * FROM vehiculos WHERE clave_empresa = ? ORDER BY no_economico',
        [claveEmpresa]
      );

      const vehiculos: Vehiculo[] = [];
      for (const row of rows) {
        const result = this.mapRowToVehiculo(row);
        if (result.success && result.value) {
          vehiculos.push(result.value);
        }
      }

      return ResultFactory.ok(vehiculos);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async findAll(): Promise<Result<Vehiculo[]>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'));
      }

      const rows = await window.electron.db.all(
        'SELECT * FROM vehiculos ORDER BY no_economico',
        []
      );

      const vehiculos: Vehiculo[] = [];
      for (const row of rows) {
        const result = this.mapRowToVehiculo(row);
        if (result.success && result.value) {
          vehiculos.push(result.value);
        }
      }

      return ResultFactory.ok(vehiculos);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      if (!window.electron) {
        return ResultFactory.fail(new Error('Electron API no disponible'));
      }

      await window.electron.db.run('DELETE FROM vehiculos WHERE id = ?', [id]);

      return ResultFactory.ok(undefined);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  private mapRowToVehiculo(row: any): Result<Vehiculo> {
    return Vehiculo.create({
      id: row.id,
      noEconomico: row.no_economico,
      placas: row.placas,
      claveEmpresa: row.clave_empresa,
      createdAt: new Date(row.created_at),
    });
  }
}
