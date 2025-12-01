import type { Result } from '../../domain/shared/Result';
import { ResultFactory } from '../../domain/shared/Result';
import { Ruta } from '../../domain/entities/Ruta';
import type { IRutaRepository } from '../../domain/repositories/IRutaRepository';
import { supabase } from '../../lib/supabase';

/**
 * Repositorio Supabase para Ruta
 * Implementa persistencia en la nube
 */
export class SupabaseRutaRepository implements IRutaRepository {
  async save(ruta: Ruta): Promise<Result<Ruta>> {
    try {
      if (!supabase) {
        return ResultFactory.fail(new Error('Supabase no configurado'));
      }

      const { error } = await supabase.from('rutas').upsert({
        id: ruta.id,
        ruta: ruta.ruta,
        clave_ruta: ruta.claveRuta,
        clave_empresa: ruta.claveEmpresa,
      });

      if (error) {
        return ResultFactory.fail(new Error(error.message));
      }

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
      if (!supabase) {
        return ResultFactory.fail(new Error('Supabase no configurado'));
      }

      const { data, error } = await supabase
        .from('rutas')
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

      return this.mapRowToRuta(data);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async findByClave(claveRuta: number): Promise<Result<Ruta | null>> {
    try {
      if (!supabase) {
        return ResultFactory.fail(new Error('Supabase no configurado'));
      }

      const { data, error } = await supabase
        .from('rutas')
        .select('*')
        .eq('clave_ruta', claveRuta)
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

      return this.mapRowToRuta(data);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async findByEmpresa(claveEmpresa: number): Promise<Result<Ruta[]>> {
    try {
      if (!supabase) {
        return ResultFactory.fail(new Error('Supabase no configurado'));
      }

      const { data, error } = await supabase
        .from('rutas')
        .select('*')
        .eq('clave_empresa', claveEmpresa)
        .order('ruta');

      if (error) {
        return ResultFactory.fail(new Error(error.message));
      }

      const rutas: Ruta[] = [];
      for (const row of data || []) {
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
      if (!supabase) {
        return ResultFactory.fail(new Error('Supabase no configurado'));
      }

      const { data, error } = await supabase
        .from('rutas')
        .select('*')
        .order('ruta');

      if (error) {
        return ResultFactory.fail(new Error(error.message));
      }

      const rutas: Ruta[] = [];
      for (const row of data || []) {
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
      if (!supabase) {
        return ResultFactory.fail(new Error('Supabase no configurado'));
      }

      const { error } = await supabase.from('rutas').delete().eq('id', id);

      if (error) {
        return ResultFactory.fail(new Error(error.message));
      }

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
