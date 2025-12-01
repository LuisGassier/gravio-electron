import type { Result } from '../../domain/shared/Result';
import { ResultFactory } from '../../domain/shared/Result';
import { Empresa } from '../../domain/entities/Empresa';
import type { IEmpresaRepository } from '../../domain/repositories/IEmpresaRepository';
import { supabase } from '../../lib/supabase';

/**
 * Repositorio Supabase para Empresa
 * Implementa persistencia en la nube
 */
export class SupabaseEmpresaRepository implements IEmpresaRepository {
  async save(empresa: Empresa): Promise<Result<Empresa>> {
    try {
      if (!supabase) {
        return ResultFactory.fail(new Error('Supabase no configurado'));
      }

      const { error } = await supabase.from('empresa').upsert({
        id: empresa.id,
        empresa: empresa.empresa,
        clave_empresa: empresa.claveEmpresa,
        prefijo: empresa.prefijo,
      });

      if (error) {
        return ResultFactory.fail(new Error(error.message));
      }

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
      if (!supabase) {
        return ResultFactory.fail(new Error('Supabase no configurado'));
      }

      const { data, error } = await supabase
        .from('empresa')
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

      return this.mapRowToEmpresa(data);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async findByClave(claveEmpresa: number): Promise<Result<Empresa | null>> {
    try {
      if (!supabase) {
        return ResultFactory.fail(new Error('Supabase no configurado'));
      }

      const { data, error } = await supabase
        .from('empresa')
        .select('*')
        .eq('clave_empresa', claveEmpresa)
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

      return this.mapRowToEmpresa(data);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async findByPrefijo(prefijo: string): Promise<Result<Empresa | null>> {
    try {
      if (!supabase) {
        return ResultFactory.fail(new Error('Supabase no configurado'));
      }

      const { data, error } = await supabase
        .from('empresa')
        .select('*')
        .eq('prefijo', prefijo)
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

      return this.mapRowToEmpresa(data);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async findAll(): Promise<Result<Empresa[]>> {
    try {
      if (!supabase) {
        return ResultFactory.fail(new Error('Supabase no configurado'));
      }

      const { data, error } = await supabase
        .from('empresa')
        .select('*')
        .order('empresa');

      if (error) {
        return ResultFactory.fail(new Error(error.message));
      }

      const empresas: Empresa[] = [];
      for (const row of data || []) {
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
      if (!supabase) {
        return ResultFactory.fail(new Error('Supabase no configurado'));
      }

      const { error } = await supabase.from('empresa').delete().eq('id', id);

      if (error) {
        return ResultFactory.fail(new Error(error.message));
      }

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
