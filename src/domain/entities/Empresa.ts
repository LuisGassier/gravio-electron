import type { Result } from '../shared/Result';
import { ResultFactory } from '../shared/Result';

export interface EmpresaProps {
  id?: string;
  empresa: string;
  claveEmpresa: number;
  prefijo: string;
}

export class Empresa {
  readonly id: string | undefined;
  readonly empresa: string;
  readonly claveEmpresa: number;
  readonly prefijo: string;

  private constructor(
    id: string | undefined,
    empresa: string,
    claveEmpresa: number,
    prefijo: string
  ) {
    this.id = id;
    this.empresa = empresa;
    this.claveEmpresa = claveEmpresa;
    this.prefijo = prefijo;
  }

  static create(props: EmpresaProps): Result<Empresa> {
    // Validar nombre de empresa
    if (!props.empresa || props.empresa.trim().length === 0) {
      return ResultFactory.fail(new Error('El nombre de la empresa es requerido'));
    }

    // Validar clave empresa
    if (!props.claveEmpresa || props.claveEmpresa <= 0) {
      return ResultFactory.fail(new Error('La clave de empresa debe ser mayor a 0'));
    }

    // Validar prefijo (4 letras mayúsculas)
    const prefijoRegex = /^[A-Z]{4}$/;
    if (!props.prefijo || !prefijoRegex.test(props.prefijo)) {
      return ResultFactory.fail(
        new Error('El prefijo debe ser exactamente 4 letras mayúsculas')
      );
    }

    return ResultFactory.ok(
      new Empresa(
        props.id,
        props.empresa.trim(),
        props.claveEmpresa,
        props.prefijo.toUpperCase()
      )
    );
  }

  toObject(): EmpresaProps {
    return {
      id: this.id,
      empresa: this.empresa,
      claveEmpresa: this.claveEmpresa,
      prefijo: this.prefijo,
    };
  }
}
