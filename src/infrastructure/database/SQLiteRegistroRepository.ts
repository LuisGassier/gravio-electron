import type { Result } from '../../domain/shared/Result';
import { ResultFactory } from '../../domain/shared/Result';
import { Registro } from '../../domain/entities/Registro';
import type { RegistroProps } from '../../domain/entities/Registro';
import type { IRegistroRepository } from '../../domain/repositories/IRegistroRepository';
import { v4 as uuidv4 } from 'uuid';

/**
 * Implementación del repositorio de registros usando SQLite local
 * Accede a la base de datos a través del IPC bridge de Electron
 */
export class SQLiteRegistroRepository implements IRegistroRepository {
  /**
   * Guarda un registro de entrada en SQLite
   *
   * Estrategia híbrida:
   * - Si el registro NO existe: INSERT puro
   * - Si el registro existe y viene de sincronización (folio actualizado): UPDATE solo campos específicos
   *
   * Esto previene sobrescribir peso_salida o fecha_salida si se registró en otra PC
   */
  async saveEntrada(registro: Registro): Promise<Result<Registro>> {
    try {
      const id = registro.id || uuidv4();
      const now = new Date().toISOString();

      // 1. Verificar si el registro ya existe
      const existing = await window.electron.db.get(
        'SELECT id, peso_salida, fecha_salida, folio FROM registros WHERE id = ?',
        [id]
      );

      if (existing) {
        // El registro YA EXISTE - solo actualizar campos seguros
        console.log(`🔄 Registro ${id} ya existe - actualizando solo folio y metadatos`)

        const updates: string[] = [];
        const params: any[] = [];

        // Solo actualizar folio si viene en el registro y no existe en local
        if (registro.folio && !existing.folio) {
          updates.push('folio = ?');
          params.push(registro.folio);
        }

        // Marcar como sincronizado si viene de Supabase
        if (registro.sincronizado) {
          updates.push('sincronizado = ?');
          params.push(1);
        }

        // Siempre actualizar updated_at
        updates.push('updated_at = ?');
        params.push(now);

        if (updates.length > 0) {
          const updateQuery = `UPDATE registros SET ${updates.join(', ')} WHERE id = ?`;
          params.push(id);
          await window.electron.db.run(updateQuery, params);
        }

        // Retornar el registro actualizado
        const updatedResult = await this.findById(id);
        return updatedResult.value ? ResultFactory.ok(updatedResult.value) : ResultFactory.fail(new Error('No se pudo recuperar el registro actualizado'));
      }

      // 2. El registro NO EXISTE - hacer INSERT puro
      console.log(`✨ Creando nuevo registro ${id}`);

      const query = `
        INSERT INTO registros (
          id, folio, clave_ruta, ruta, placa_vehiculo, numero_economico,
          clave_operador, operador, clave_empresa, clave_concepto, concepto_id,
          peso_entrada, peso_salida, fecha_entrada, fecha_salida, tipo_pesaje, observaciones,
          sincronizado, fecha_registro, created_at, updated_at, registrado_por
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        id,
        registro.folio || null,
        registro.claveRuta,
        registro.ruta,
        registro.placaVehiculo,
        registro.numeroEconomico,
        registro.claveOperador,
        registro.operador,
        registro.claveEmpresa,
        registro.claveConcepto,
        registro.conceptoId || null,
        registro.pesoEntrada || null,
        null, // peso_salida SIEMPRE null en entrada
        registro.fechaEntrada?.toISOString() || null,
        null, // fecha_salida SIEMPRE null en entrada
        'entrada', // tipo_pesaje SIEMPRE 'entrada'
        registro.observaciones || null,
        registro.sincronizado ? 1 : 0,
        now,
        now,
        now,
        registro.registradoPor || null,
      ];

      await window.electron.db.run(query, params);

      // Crear el registro con el ID generado
      const savedRegistro = Registro.create({
        ...registro.toObject(),
        id,
        fechaRegistro: new Date(now),
        createdAt: new Date(now),
        updatedAt: new Date(now),
      });

      if (!savedRegistro.success) {
        return savedRegistro;
      }

      return ResultFactory.ok(savedRegistro.value);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  /**
   * Actualiza un registro con información de salida
   */
  async updateWithSalida(
    id: string,
    pesoSalida: number,
    fechaSalida: Date,
    observaciones?: string
  ): Promise<Result<Registro>> {
    try {
      // Primero obtener el registro actual
      const findResult = await this.findById(id);

      if (!findResult.success || !findResult.value) {
        return ResultFactory.fail(new Error(`Registro no encontrado: ${id}`));
      }

      const registro = findResult.value;

      // Crear el registro actualizado usando el método de dominio
      const updatedRegistroResult = registro.withSalida(
        pesoSalida,
        fechaSalida,
        observaciones
      );

      if (!updatedRegistroResult.success) {
        return updatedRegistroResult;
      }

      const updatedRegistro = updatedRegistroResult.value;

      // Actualizar en la base de datos
      const query = `
        UPDATE registros 
        SET peso_salida = ?,
            fecha_salida = ?,
            tipo_pesaje = ?,
            observaciones = ?,
            sincronizado = 0,
            updated_at = ?
        WHERE id = ?
      `;

      const params = [
        updatedRegistro.pesoSalida,
        updatedRegistro.fechaSalida?.toISOString(),
        updatedRegistro.tipoPesaje,
        updatedRegistro.observaciones || null,
        new Date().toISOString(),
        id,
      ];

      await window.electron.db.run(query, params);

      return ResultFactory.ok(updatedRegistro);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  /**
   * Busca un registro por ID
   */
  async findById(id: string): Promise<Result<Registro | null>> {
    try {
      const query = 'SELECT * FROM registros WHERE id = ?';
      const row = await window.electron.db.get(query, [id]);

      if (!row) {
        return ResultFactory.ok(null);
      }

      return this.mapRowToRegistro(row);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  /**
   * Busca un registro por folio
   */
  async findByFolio(folio: string): Promise<Result<Registro | null>> {
    try {
      const query = 'SELECT * FROM registros WHERE folio = ?';
      const row = await window.electron.db.get(query, [folio]);

      if (!row) {
        return ResultFactory.ok(null);
      }

      return this.mapRowToRegistro(row);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  /**
   * Busca registros pendientes de completar por placa
   */
  async findPendingByPlaca(placa: string): Promise<Result<Registro[]>> {
    try {
      const query = `
        SELECT * FROM registros 
        WHERE placa_vehiculo = ? 
        AND tipo_pesaje = 'entrada'
        AND peso_salida IS NULL
        ORDER BY fecha_entrada DESC
      `;

      const rows = await window.electron.db.all(query, [placa.toUpperCase()]);

      const registros: Registro[] = [];

      for (const row of rows) {
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
      const query = `
        SELECT * FROM registros 
        WHERE peso_salida IS NULL
        AND fecha_salida IS NULL
        ORDER BY fecha_entrada DESC
      `;

      const rows = await window.electron.db.all(query);

      const registros: Registro[] = [];

      for (const row of rows) {
        const registroResult = await this.mapRowToRegistro(row);
        if (registroResult.success && registroResult.value) {
          registros.push(registroResult.value);
        } else {
          console.warn('⚠️ Error al mapear registro:', row, registroResult);
        }
      }

      return ResultFactory.ok(registros);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  /**
   * Obtiene todos los registros (completados y pendientes)
   */
  async findAll(): Promise<Result<Registro[]>> {
    try {
      const query = `
        SELECT * FROM registros 
        ORDER BY fecha_registro DESC
      `;

      const rows = await window.electron.db.all(query);

      const registros: Registro[] = [];

      for (const row of rows) {
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
   * Obtiene todos los registros no sincronizados
   */
  async findUnsynchronized(): Promise<Result<Registro[]>> {
    try {
      const query = `
        SELECT * FROM registros 
        WHERE sincronizado = 0
        ORDER BY created_at ASC
      `;

      const rows = await window.electron.db.all(query);

      const registros: Registro[] = [];

      for (const row of rows) {
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
   * Marca un registro como sincronizado
   */
  async markAsSynced(id: string): Promise<Result<void>> {
    try {
      const query = `
        UPDATE registros 
        SET sincronizado = 1, updated_at = ?
        WHERE id = ?
      `;

      await window.electron.db.run(query, [new Date().toISOString(), id]);

      return ResultFactory.ok(undefined);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  /**
   * Obtiene registros por rango de fechas
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Result<Registro[]>> {
    try {
      const query = `
        SELECT * FROM registros 
        WHERE fecha_registro >= ? AND fecha_registro <= ?
        ORDER BY fecha_registro DESC
      `;

      const rows = await window.electron.db.all(query, [
        startDate.toISOString(),
        endDate.toISOString(),
      ]);

      const registros: Registro[] = [];

      for (const row of rows) {
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
   * Obtiene registros por empresa
   */
  async findByEmpresa(claveEmpresa: number, limit = 100): Promise<Result<Registro[]>> {
    try {
      const query = `
        SELECT * FROM registros 
        WHERE clave_empresa = ?
        ORDER BY fecha_registro DESC
        LIMIT ?
      `;

      const rows = await window.electron.db.all(query, [claveEmpresa, limit]);

      const registros: Registro[] = [];

      for (const row of rows) {
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
      const query = 'DELETE FROM registros WHERE id = ?';
      await window.electron.db.run(query, [id]);

      return ResultFactory.ok(undefined);
    } catch (error) {
      return ResultFactory.fromError(error);
    }
  }

  /**
   * Mapea una fila de la base de datos a una entidad Registro
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
        sincronizado: row.sincronizado === 1,
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
