import type { Result } from '../shared/Result';
import { ResultFactory } from '../shared/Result';

export interface RutaProps {
  id?: number;
  ruta: string;
  claveRuta: number;
  claveEmpresa: number;
}

export class Ruta {
  readonly id: number | undefined;
  readonly ruta: string;
  readonly claveRuta: number;
  readonly claveEmpresa: number;

  private constructor(
    id: number | undefined,
    ruta: string,
    claveRuta: number,
    claveEmpresa: number
  ) {
    this.id = id;
    this.ruta = ruta;
    this.claveRuta = claveRuta;
    this.claveEmpresa = claveEmpresa;
  }

  static create(props: RutaProps): Result<Ruta> {
    // Validar nombre de ruta
    if (!props.ruta || props.ruta.trim().length === 0) {
      return ResultFactory.fail(new Error('El nombre de la ruta es requerido'));
    }

    if (props.ruta.trim().length < 3) {
      return ResultFactory.fail(
        new Error('El nombre de la ruta debe tener al menos 3 caracteres')
      );
    }

    // Validar clave ruta
    if (!props.claveRuta || props.claveRuta <= 0) {
      return ResultFactory.fail(new Error('La clave de la ruta es requerida'));
    }

    // Validar clave empresa
    if (!props.claveEmpresa || props.claveEmpresa <= 0) {
      return ResultFactory.fail(new Error('La clave de empresa es requerida'));
    }

    return ResultFactory.ok(
      new Ruta(props.id, props.ruta.trim(), props.claveRuta, props.claveEmpresa)
    );
  }

  toObject(): RutaProps {
    return {
      id: this.id,
      ruta: this.ruta,
      claveRuta: this.claveRuta,
      claveEmpresa: this.claveEmpresa,
    };
  }
}
