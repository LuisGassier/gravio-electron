import type { Result } from '../shared/Result';
import { ResultFactory } from '../shared/Result';

export type TipoPesaje = 'entrada' | 'salida' | 'completo';

export interface RegistroProps {
  id?: string;
  folio?: string;
  claveRuta: number;
  ruta: string;
  placaVehiculo: string;
  numeroEconomico: string;
  claveOperador: number;
  operador: string;
  claveEmpresa: number;
  claveConcepto: number;
  conceptoId?: string;
  pesoEntrada?: number;
  pesoSalida?: number;
  fechaEntrada?: Date;
  fechaSalida?: Date;
  tipoPesaje: TipoPesaje;
  observaciones?: string;
  sincronizado?: boolean;
  fechaRegistro?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Registro {
  readonly id: string | undefined;
  readonly folio: string | undefined;
  readonly claveRuta: number;
  readonly ruta: string;
  readonly placaVehiculo: string;
  readonly numeroEconomico: string;
  readonly claveOperador: number;
  readonly operador: string;
  readonly claveEmpresa: number;
  readonly claveConcepto: number;
  readonly conceptoId: string | undefined;
  readonly pesoEntrada: number | undefined;
  readonly pesoSalida: number | undefined;
  readonly fechaEntrada: Date | undefined;
  readonly fechaSalida: Date | undefined;
  readonly tipoPesaje: TipoPesaje;
  readonly observaciones: string | undefined;
  readonly sincronizado: boolean;
  readonly fechaRegistro: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(
    id: string | undefined,
    folio: string | undefined,
    claveRuta: number,
    ruta: string,
    placaVehiculo: string,
    numeroEconomico: string,
    claveOperador: number,
    operador: string,
    claveEmpresa: number,
    claveConcepto: number,
    conceptoId: string | undefined,
    pesoEntrada: number | undefined,
    pesoSalida: number | undefined,
    fechaEntrada: Date | undefined,
    fechaSalida: Date | undefined,
    tipoPesaje: TipoPesaje,
    observaciones: string | undefined,
    sincronizado: boolean,
    fechaRegistro: Date,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.folio = folio;
    this.claveRuta = claveRuta;
    this.ruta = ruta;
    this.placaVehiculo = placaVehiculo;
    this.numeroEconomico = numeroEconomico;
    this.claveOperador = claveOperador;
    this.operador = operador;
    this.claveEmpresa = claveEmpresa;
    this.claveConcepto = claveConcepto;
    this.conceptoId = conceptoId;
    this.pesoEntrada = pesoEntrada;
    this.pesoSalida = pesoSalida;
    this.fechaEntrada = fechaEntrada;
    this.fechaSalida = fechaSalida;
    this.tipoPesaje = tipoPesaje;
    this.observaciones = observaciones;
    this.sincronizado = sincronizado;
    this.fechaRegistro = fechaRegistro;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(props: RegistroProps): Result<Registro> {
    // Validar placa vehículo
    if (!props.placaVehiculo || props.placaVehiculo.trim().length === 0) {
      return ResultFactory.fail(new Error('La placa del vehículo es requerida'));
    }

    // Validar número económico
    if (!props.numeroEconomico || props.numeroEconomico.trim().length === 0) {
      return ResultFactory.fail(new Error('El número económico es requerido'));
    }

    // Validar claves
    if (!props.claveRuta || props.claveRuta <= 0) {
      return ResultFactory.fail(new Error('La clave de ruta es requerida'));
    }

    if (!props.claveOperador || props.claveOperador <= 0) {
      return ResultFactory.fail(new Error('La clave de operador es requerida'));
    }

    if (!props.claveEmpresa || props.claveEmpresa <= 0) {
      return ResultFactory.fail(new Error('La clave de empresa es requerida'));
    }

    if (!props.claveConcepto || props.claveConcepto <= 0) {
      return ResultFactory.fail(new Error('La clave de concepto es requerida'));
    }

    // Validar nombres
    if (!props.ruta || props.ruta.trim().length === 0) {
      return ResultFactory.fail(new Error('El nombre de la ruta es requerido'));
    }

    if (!props.operador || props.operador.trim().length === 0) {
      return ResultFactory.fail(new Error('El nombre del operador es requerido'));
    }

    // Validar tipo de pesaje
    const tiposValidos: TipoPesaje[] = ['entrada', 'salida', 'completo'];
    if (!tiposValidos.includes(props.tipoPesaje)) {
      return ResultFactory.fail(
        new Error('Tipo de pesaje inválido. Debe ser: entrada, salida o completo')
      );
    }

    // Validar pesos (deben ser positivos si existen)
    if (props.pesoEntrada !== undefined && props.pesoEntrada <= 0) {
      return ResultFactory.fail(new Error('El peso de entrada debe ser mayor a 0'));
    }

    if (props.pesoSalida !== undefined && props.pesoSalida <= 0) {
      return ResultFactory.fail(new Error('El peso de salida debe ser mayor a 0'));
    }

    // Validar consistencia de tipo de pesaje
    if (props.tipoPesaje === 'entrada' && !props.pesoEntrada) {
      return ResultFactory.fail(
        new Error('Para tipo entrada debe existir peso de entrada')
      );
    }

    if (props.tipoPesaje === 'completo' && (!props.pesoEntrada || !props.pesoSalida)) {
      return ResultFactory.fail(
        new Error('Para tipo completo deben existir ambos pesos')
      );
    }

    const now = new Date();

    return ResultFactory.ok(
      new Registro(
        props.id,
        props.folio,
        props.claveRuta,
        props.ruta.trim(),
        props.placaVehiculo.toUpperCase().trim(),
        props.numeroEconomico.trim(),
        props.claveOperador,
        props.operador.trim(),
        props.claveEmpresa,
        props.claveConcepto,
        props.conceptoId,
        props.pesoEntrada,
        props.pesoSalida,
        props.fechaEntrada,
        props.fechaSalida,
        props.tipoPesaje,
        props.observaciones?.trim(),
        props.sincronizado ?? false,
        props.fechaRegistro || now,
        props.createdAt || now,
        props.updatedAt || now
      )
    );
  }

  /**
   * Crea un nuevo registro con peso de salida
   */
  withSalida(pesoSalida: number, fechaSalida: Date, observaciones?: string): Result<Registro> {
    if (pesoSalida <= 0) {
      return ResultFactory.fail(new Error('El peso de salida debe ser mayor a 0'));
    }

    if (!this.pesoEntrada) {
      return ResultFactory.fail(
        new Error('No se puede agregar salida sin peso de entrada')
      );
    }

    return Registro.create({
      ...this.toObject(),
      pesoSalida,
      fechaSalida,
      tipoPesaje: 'completo',
      observaciones: observaciones || this.observaciones,
      sincronizado: false, // Marcar como no sincronizado al actualizar
      updatedAt: new Date(),
    });
  }

  /**
   * Calcula el peso neto (entrada - salida)
   */
  getPesoNeto(): number | undefined {
    if (this.pesoEntrada && this.pesoSalida) {
      return Math.abs(this.pesoEntrada - this.pesoSalida);
    }
    return undefined;
  }

  /**
   * Verifica si el registro está completo
   */
  isCompleto(): boolean {
    return this.tipoPesaje === 'completo' && !!this.pesoEntrada && !!this.pesoSalida;
  }

  /**
   * Verifica si necesita sincronización
   */
  needsSync(): boolean {
    return !this.sincronizado;
  }

  /**
   * Marca el registro como sincronizado
   */
  markAsSynced(): Registro {
    return new Registro(
      this.id,
      this.folio,
      this.claveRuta,
      this.ruta,
      this.placaVehiculo,
      this.numeroEconomico,
      this.claveOperador,
      this.operador,
      this.claveEmpresa,
      this.claveConcepto,
      this.conceptoId,
      this.pesoEntrada,
      this.pesoSalida,
      this.fechaEntrada,
      this.fechaSalida,
      this.tipoPesaje,
      this.observaciones,
      true, // sincronizado
      this.fechaRegistro,
      this.createdAt,
      new Date() // updated_at
    );
  }

  toObject(): RegistroProps {
    return {
      id: this.id,
      folio: this.folio,
      claveRuta: this.claveRuta,
      ruta: this.ruta,
      placaVehiculo: this.placaVehiculo,
      numeroEconomico: this.numeroEconomico,
      claveOperador: this.claveOperador,
      operador: this.operador,
      claveEmpresa: this.claveEmpresa,
      claveConcepto: this.claveConcepto,
      conceptoId: this.conceptoId,
      pesoEntrada: this.pesoEntrada,
      pesoSalida: this.pesoSalida,
      fechaEntrada: this.fechaEntrada,
      fechaSalida: this.fechaSalida,
      tipoPesaje: this.tipoPesaje,
      observaciones: this.observaciones,
      sincronizado: this.sincronizado,
      fechaRegistro: this.fechaRegistro,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
