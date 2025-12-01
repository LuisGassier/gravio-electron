import type { Result } from '../shared/Result';
import { ResultFactory } from '../shared/Result';

export interface OperadorProps {
  id?: string;
  operador: string;
  claveOperador: number;
  createdAt?: Date;
}

export class Operador {
  readonly id: string | undefined;
  readonly operador: string;
  readonly claveOperador: number;
  readonly createdAt: Date;

  private constructor(
    id: string | undefined,
    operador: string,
    claveOperador: number,
    createdAt: Date
  ) {
    this.id = id;
    this.operador = operador;
    this.claveOperador = claveOperador;
    this.createdAt = createdAt;
  }

  static create(props: OperadorProps): Result<Operador> {
    // Validar nombre del operador
    if (!props.operador || props.operador.trim().length === 0) {
      return ResultFactory.fail(new Error('El nombre del operador es requerido'));
    }

    if (props.operador.trim().length < 3) {
      return ResultFactory.fail(
        new Error('El nombre del operador debe tener al menos 3 caracteres')
      );
    }

    // Validar clave operador
    if (!props.claveOperador || props.claveOperador <= 0) {
      return ResultFactory.fail(new Error('La clave del operador es requerida'));
    }

    return ResultFactory.ok(
      new Operador(
        props.id,
        props.operador.trim(),
        props.claveOperador,
        props.createdAt || new Date()
      )
    );
  }

  toObject(): OperadorProps {
    return {
      id: this.id,
      operador: this.operador,
      claveOperador: this.claveOperador,
      createdAt: this.createdAt,
    };
  }
}
