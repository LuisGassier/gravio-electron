import type { Result } from '../../domain/shared/Result';
import { ResultFactory } from '../../domain/shared/Result';
import { Vehiculo } from '../../domain/entities/Vehiculo';
import type { IVehiculoRepository } from '../../domain/repositories/IVehiculoRepository';
import { supabase } from '../../lib/supabase';

/**
 * Repositorio Supabase para Vehiculo
 * Implementa persistencia en la nube
 */
export class SupabaseVehiculoRepository implements IVehiculoRepository {
  async save(vehiculo: Vehiculo): Promise<Result<Vehiculo>> {
    try {
      if (!supabase) {
        return ResultFactory.fail(new Error('Supabase no configurado'));
      }

      const { error } = await supabase.from('vehiculos').upsert({
        id: vehiculo.id,
        no_economico: vehiculo.noEconomico,
        placas: vehiculo.placas,
        clave_empresa: vehiculo.claveEmpresa,
        created_at: vehiculo.createdAt.toISOString(),
      });

      if (error) {
        return ResultFactory.fail(new Error(error.message));
      }

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
      if (!supabase) {
        return ResultFactory.fail(new Error('Supabase no configurado'));
      }

      const { data, error } = await supabase
        .from('vehiculos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return ResultFactory.ok(null);
        }
        return ResultFactory.fail(new Error(error.message));
      }

      if (!data) {
        return ResultFactory.ok(null);
      }

      return this.mapRowToVehiculo(data);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async findByPlaca(placa: string): Promise<Result<Vehiculo | null>> {
    try {
      if (!supabase) {
        return ResultFactory.fail(new Error('Supabase no configurado'));
      }

      const { data, error } = await supabase
        .from('vehiculos')
        .select('*')
        .eq('placas', placa)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return ResultFactory.ok(null);
        }
        return ResultFactory.fail(new Error(error.message));
      }

      if (!data) {
        return ResultFactory.ok(null);
      }

      return this.mapRowToVehiculo(data);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async findByPlacas(placas: string[]): Promise<Result<Vehiculo[]>> {
    try {
      if (!supabase) {
        return ResultFactory.fail(new Error('Supabase no configurado'));
      }

      if (placas.length === 0) {
        return ResultFactory.ok([]);
      }

      const { data, error } = await supabase
        .from('vehiculos')
        .select('*')
        .in('placas', placas);

      if (error) {
        return ResultFactory.fail(new Error(error.message));
      }

      const vehiculos: Vehiculo[] = [];
      for (const row of data || []) {
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
      if (!supabase) {
        return ResultFactory.fail(new Error('Supabase no configurado'));
      }

      const { data, error } = await supabase
        .from('vehiculos')
        .select('*')
        .eq('no_economico', noEconomico)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return ResultFactory.ok(null);
        }
        return ResultFactory.fail(new Error(error.message));
      }

      if (!data) {
        return ResultFactory.ok(null);
      }

      return this.mapRowToVehiculo(data);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async findByEmpresa(claveEmpresa: number): Promise<Result<Vehiculo[]>> {
    try {
      if (!supabase) {
        return ResultFactory.fail(new Error('Supabase no configurado'));
      }

      const { data, error } = await supabase
        .from('vehiculos')
        .select('*')
        .eq('clave_empresa', claveEmpresa)
        .order('no_economico');

      if (error) {
        return ResultFactory.fail(new Error(error.message));
      }

      const vehiculos: Vehiculo[] = [];
      for (const row of data || []) {
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
      if (!supabase) {
        return ResultFactory.fail(new Error('Supabase no configurado'));
      }

      const { data, error } = await supabase
        .from('vehiculos')
        .select('*')
        .order('no_economico');

      if (error) {
        return ResultFactory.fail(new Error(error.message));
      }

      const vehiculos: Vehiculo[] = [];
      for (const row of data || []) {
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
      if (!supabase) {
        return ResultFactory.fail(new Error('Supabase no configurado'));
      }

      const { error } = await supabase.from('vehiculos').delete().eq('id', id);

      if (error) {
        return ResultFactory.fail(new Error(error.message));
      }

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
