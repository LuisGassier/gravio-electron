import type { Result } from '../shared/Result';
import { ResultFactory } from '../shared/Result';

export interface VehiculoProps {
  id?: string;
  noEconomico: string;
  placas: string;
  claveEmpresa: number;
  createdAt?: Date;
}

export class Vehiculo {
  readonly id: string | undefined;
  readonly noEconomico: string;
  readonly placas: string;
  readonly claveEmpresa: number;
  readonly createdAt: Date;

  private constructor(
    id: string | undefined,
    noEconomico: string,
    placas: string,
    claveEmpresa: number,
    createdAt: Date
  ) {
    this.id = id;
    this.noEconomico = noEconomico;
    this.placas = placas;
    this.claveEmpresa = claveEmpresa;
    this.createdAt = createdAt;
  }

  static create(props: VehiculoProps): Result<Vehiculo> {
    // Validar número económico
    if (!props.noEconomico || props.noEconomico.trim().length === 0) {
      return ResultFactory.fail(new Error('El número económico es requerido'));
    }

    // Validar placas
    if (!props.placas || props.placas.trim().length === 0) {
      return ResultFactory.fail(new Error('Las placas son requeridas'));
    }

    // Validar formato de placas (ejemplo: SP30173, SP28521)
    const placasRegex = /^[A-Z0-9-]+$/;
    if (!placasRegex.test(props.placas.toUpperCase())) {
      return ResultFactory.fail(
        new Error('Las placas deben contener solo letras, números y guiones')
      );
    }

    // Validar clave empresa
    if (!props.claveEmpresa || props.claveEmpresa <= 0) {
      return ResultFactory.fail(new Error('La clave de empresa es requerida'));
    }

    return ResultFactory.ok(
      new Vehiculo(
        props.id,
        props.noEconomico.trim(),
        props.placas.toUpperCase().trim(),
        props.claveEmpresa,
        props.createdAt || new Date()
      )
    );
  }

  toObject(): VehiculoProps {
    return {
      id: this.id,
      noEconomico: this.noEconomico,
      placas: this.placas,
      claveEmpresa: this.claveEmpresa,
      createdAt: this.createdAt,
    };
  }
}
