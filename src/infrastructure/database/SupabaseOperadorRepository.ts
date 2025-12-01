import type { Result } from '../../domain/shared/Result';
import { ResultFactory } from '../../domain/shared/Result';
import { Operador } from '../../domain/entities/Operador';
import type { IOperadorRepository } from '../../domain/repositories/IOperadorRepository';
import { supabase } from '../../lib/supabase';

/**
 * Repositorio Supabase para Operador
 * Implementa persistencia en la nube
 */
export class SupabaseOperadorRepository implements IOperadorRepository {
  async save(operador: Operador): Promise<Result<Operador>> {
    try {
      if (!supabase) {
        return ResultFactory.fail(new Error('Supabase no configurado'));
      }

      const { error } = await supabase.from('operadores').upsert({
        id: operador.id,
        operador: operador.operador,
        clave_operador: operador.claveOperador,
        created_at: operador.createdAt.toISOString(),
      });

      if (error) {
        return ResultFactory.fail(new Error(error.message));
      }

      return ResultFactory.ok(operador);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async update(operador: Operador): Promise<Result<Operador>> {
    return this.save(operador);
  }

  async findById(id: string): Promise<Result<Operador | null>> {
    try {
      if (!supabase) {
        return ResultFactory.fail(new Error('Supabase no configurado'));
      }

      const { data, error } = await supabase
        .from('operadores')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return ResultFactory.ok(null);
        }
        return ResultFactory.fail(error.message);
      }

      if (!data) {
        return ResultFactory.ok(null);
      }

      return this.mapRowToOperador(data);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async findByClave(claveOperador: number): Promise<Result<Operador | null>> {
    try {
      if (!supabase) {
        return ResultFactory.fail(new Error('Supabase no configurado'));
      }

      const { data, error } = await supabase
        .from('operadores')
        .select('*')
        .eq('clave_operador', claveOperador)
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

      return this.mapRowToOperador(data);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  async findByEmpresa(claveEmpresa: number): Promise<Result<Operador[]>> {
    try {
      if (!supabase) {
        return ResultFactory.fail(new Error('Supabase no configurado'));
      }

      const { data, error } = await supabase
        .from('operadores')
        .select('operadores.*, operadores_empresas!inner(clave_empresa)')
        .eq('operadores_empresas.clave_empresa', claveEmpresa)
        .order('operador');

      if (error) {
        return ResultFactory.fail(new Error(error.message));
      }

      const operadores: Operador[] = [];
      for (const row of data || []) {
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

  async findAll(): Promise<Result<Operador[]>> {
    try {
      if (!supabase) {
        return ResultFactory.fail(new Error('Supabase no configurado'));
      }

      const { data, error } = await supabase
        .from('operadores')
        .select('*')
        .order('operador');

      if (error) {
        return ResultFactory.fail(new Error(error.message));
      }

      const operadores: Operador[] = [];
      for (const row of data || []) {
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
      if (!supabase) {
        return ResultFactory.fail(new Error('Supabase no configurado'));
      }

      const { error } = await supabase.from('operadores').delete().eq('id', id);

      if (error) {
        return ResultFactory.fail(new Error(error.message));
      }

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
