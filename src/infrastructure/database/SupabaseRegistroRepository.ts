import type { Result } from '../../domain/shared/Result';
import { ResultFactory } from '../../domain/shared/Result';
import { Registro } from '../../domain/entities/Registro';
import type { RegistroProps } from '../../domain/entities/Registro';
import type { IRegistroRepository } from '../../domain/repositories/IRegistroRepository';
import { supabase } from '../../lib/supabase';

/**
 * Implementación del repositorio de registros usando Supabase
 * Usado principalmente para sincronización desde SQLite
 */
export class SupabaseRegistroRepository implements IRegistroRepository {
  /**
   * Guarda un registro en Supabase
   * El trigger generar_folio() se ejecutará automáticamente si folio es null
   */
  async saveEntrada(registro: Registro): Promise<Result<Registro>> {
    try {
      console.log('🔵 SupabaseRegistroRepository.saveEntrada - Intentando guardar:', {
        id: registro.id,
        placaVehiculo: registro.placaVehiculo,
        claveOperador: registro.claveOperador,
        claveRuta: registro.claveRuta,
        claveConcepto: registro.claveConcepto,
      });

      const data = {
        id: registro.id,
        folio: registro.folio || null, // Dejar null para que Supabase genere el folio
        clave_ruta: registro.claveRuta,
        ruta: registro.ruta,
        placa_vehiculo: registro.placaVehiculo,
        numero_economico: registro.numeroEconomico,
        clave_operador: registro.claveOperador,
        operador: registro.operador,
        clave_empresa: registro.claveEmpresa,
        clave_concepto: registro.claveConcepto,
        concepto_id: registro.conceptoId || null,
        peso_entrada: registro.pesoEntrada || null,
        peso_salida: registro.pesoSalida || null,
        fecha_entrada: registro.fechaEntrada?.toISOString() || null,
        fecha_salida: registro.fechaSalida?.toISOString() || null,
        tipo_pesaje: registro.tipoPesaje,
        observaciones: registro.observaciones || null,
        sincronizado: true, // En Supabase siempre es true
        fecha_registro: registro.fechaRegistro.toISOString(),
        registrado_por: registro.registradoPor || null,
      };

      console.log('🔵 SupabaseRegistroRepository.saveEntrada - Datos a enviar:', data);

      const { data: savedData, error } = await supabase
        .from('registros')
        .upsert(data, { onConflict: 'id' })
        .select()
        .single();

      console.log('🔵 SupabaseRegistroRepository.saveEntrada - Respuesta:', { savedData, error });

      if (error) {
        return ResultFactory.fail(new Error(`Error al guardar en Supabase: ${error.message}`));
      }

      if (!savedData) {
        return ResultFactory.fail(new Error('No se recibieron datos de Supabase'));
      }

      // El folio fue generado por Supabase, mapeamos el resultado
      const mappedResult = await this.mapRowToRegistro(savedData);
      
      if (!mappedResult.success || !mappedResult.value) {
        return ResultFactory.fail(new Error('Error al mapear registro guardado'));
      }

      return ResultFactory.ok(mappedResult.value);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  /**
   * Actualiza un registro con peso de salida en Supabase
   */
  async updateWithSalida(
    id: string,
    pesoSalida: number,
    fechaSalida: Date,
    observaciones?: string
  ): Promise<Result<Registro>> {
    try {
      const { data, error } = await supabase
        .from('registros')
        .update({
          peso_salida: pesoSalida,
          fecha_salida: fechaSalida.toISOString(),
          tipo_pesaje: 'completo',
          observaciones: observaciones || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return ResultFactory.fail(new Error(`Error al actualizar en Supabase: ${error.message}`));
      }

      if (!data) {
        return ResultFactory.fail(new Error('No se recibieron datos de Supabase'));
      }

      const mappedResult = await this.mapRowToRegistro(data);
      
      if (!mappedResult.success || !mappedResult.value) {
        return ResultFactory.fail(new Error('Error al mapear registro actualizado'));
      }

      return ResultFactory.ok(mappedResult.value);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  /**
   * Busca un registro por ID
   */
  async findById(id: string): Promise<Result<Registro | null>> {
    try {
      const { data, error } = await supabase
        .from('registros')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No encontrado
          return ResultFactory.ok(null);
        }
        return ResultFactory.fail(new Error(`Error al buscar registro: ${error.message}`));
      }

      return this.mapRowToRegistro(data);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  /**
   * Busca un registro por folio
   */
  async findByFolio(folio: string): Promise<Result<Registro | null>> {
    try {
      const { data, error } = await supabase
        .from('registros')
        .select('*')
        .eq('folio', folio)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return ResultFactory.ok(null);
        }
        return ResultFactory.fail(new Error(`Error al buscar registro: ${error.message}`));
      }

      return this.mapRowToRegistro(data);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  /**
   * Busca registros pendientes por placa
   */
  async findPendingByPlaca(placa: string): Promise<Result<Registro[]>> {
    try {
      const { data, error } = await supabase
        .from('registros')
        .select('*')
        .eq('placa_vehiculo', placa.toUpperCase())
        .eq('tipo_pesaje', 'entrada')
        .is('peso_salida', null)
        .order('fecha_entrada', { ascending: false });

      if (error) {
        return ResultFactory.fail(new Error(`Error al buscar registros: ${error.message}`));
      }

      const registros: Registro[] = [];

      for (const row of data || []) {
        const registroResult = await this.mapRowToRegistro(row);
        if (registroResult.success && registroResult.value) {
          registros.push(registroResult.value);
        }
      }

      return ResultFactory.ok(registros);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  /**
   * Obtiene todos los registros pendientes (sin salida)
   */
  async findAllPending(): Promise<Result<Registro[]>> {
    try {
      const { data, error } = await supabase
        .from('registros')
        .select('*')
        .eq('tipo_pesaje', 'entrada')
        .is('peso_salida', null)
        .order('fecha_entrada', { ascending: false });

      if (error) {
        return ResultFactory.fail(new Error(`Error al buscar registros: ${error.message}`));
      }

      const registros: Registro[] = [];

      for (const row of data || []) {
        const registroResult = await this.mapRowToRegistro(row);
        if (registroResult.success && registroResult.value) {
          registros.push(registroResult.value);
        }
      }

      return ResultFactory.ok(registros);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  /**
   * Obtiene todos los registros
   */
  async findAll(): Promise<Result<Registro[]>> {
    try {
      const { data, error } = await supabase
        .from('registros')
        .select('*')
        .order('fecha_registro', { ascending: false });

      if (error) {
        return ResultFactory.fail(new Error(`Error al buscar registros: ${error.message}`));
      }

      const registros: Registro[] = [];

      for (const row of data || []) {
        const registroResult = await this.mapRowToRegistro(row);
        if (registroResult.success && registroResult.value) {
          registros.push(registroResult.value);
        }
      }

      return ResultFactory.ok(registros);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  /**
   * No usado para Supabase - todos los registros están sincronizados
   */
  async findUnsynchronized(): Promise<Result<Registro[]>> {
    return ResultFactory.ok([]);
  }

  /**
   * No aplica para Supabase
   */
  async markAsSynced(_id: string): Promise<Result<void>> {
    return ResultFactory.ok(undefined);
  }

  /**
   * Busca registros por rango de fechas
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Result<Registro[]>> {
    try {
      const { data, error } = await supabase
        .from('registros')
        .select('*')
        .gte('fecha_registro', startDate.toISOString())
        .lte('fecha_registro', endDate.toISOString())
        .order('fecha_registro', { ascending: false });

      if (error) {
        return ResultFactory.fail(new Error(`Error al buscar registros: ${error.message}`));
      }

      const registros: Registro[] = [];

      for (const row of data || []) {
        const registroResult = await this.mapRowToRegistro(row);
        if (registroResult.success && registroResult.value) {
          registros.push(registroResult.value);
        }
      }

      return ResultFactory.ok(registros);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  /**
   * Busca registros por empresa
   */
  async findByEmpresa(claveEmpresa: number, limit = 100): Promise<Result<Registro[]>> {
    try {
      const { data, error } = await supabase
        .from('registros')
        .select('*')
        .eq('clave_empresa', claveEmpresa)
        .order('fecha_registro', { ascending: false })
        .limit(limit);

      if (error) {
        return ResultFactory.fail(new Error(`Error al buscar registros: ${error.message}`));
      }

      const registros: Registro[] = [];

      for (const row of data || []) {
        const registroResult = await this.mapRowToRegistro(row);
        if (registroResult.success && registroResult.value) {
          registros.push(registroResult.value);
        }
      }

      return ResultFactory.ok(registros);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  /**
   * Elimina un registro
   */
  async delete(id: string): Promise<Result<void>> {
    try {
      const { error } = await supabase.from('registros').delete().eq('id', id);

      if (error) {
        return ResultFactory.fail(new Error(`Error al eliminar registro: ${error.message}`));
      }

      return ResultFactory.ok(undefined);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  /**
   * Mapea una fila de Supabase a una entidad Registro
   */
  private async mapRowToRegistro(row: any): Promise<Result<Registro | null>> {
    try {
      const props: RegistroProps = {
        id: row.id,
        folio: row.folio || undefined,
        claveRuta: row.clave_ruta,
        ruta: row.ruta,
        placaVehiculo: row.placa_vehiculo,
        numeroEconomico: row.numero_economico,
        claveOperador: row.clave_operador,
        operador: row.operador,
        claveEmpresa: row.clave_empresa,
        claveConcepto: row.clave_concepto,
        conceptoId: row.concepto_id || undefined,
        pesoEntrada: row.peso_entrada ? parseFloat(row.peso_entrada) : undefined,
        pesoSalida: row.peso_salida ? parseFloat(row.peso_salida) : undefined,
        fechaEntrada: row.fecha_entrada ? new Date(row.fecha_entrada) : undefined,
        fechaSalida: row.fecha_salida ? new Date(row.fecha_salida) : undefined,
        tipoPesaje: row.tipo_pesaje,
        observaciones: row.observaciones || undefined,
        sincronizado: row.sincronizado || true,
        fechaRegistro: row.fecha_registro ? new Date(row.fecha_registro) : undefined,
        createdAt: row.created_at ? new Date(row.created_at) : undefined,
        updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
        registradoPor: row.registrado_por || undefined,
      };

      return Registro.create(props);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }
}
