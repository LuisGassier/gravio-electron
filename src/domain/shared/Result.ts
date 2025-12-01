/**
 * Result Pattern para manejo funcional de errores
 * Evita excepciones y hace explícito el manejo de errores
 */

export type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

export class ResultFactory {
  static ok<T, E = Error>(value: T): Result<T, E> {
    return { success: true, value };
  }

  static fail<T, E = Error>(error: E): Result<T, E> {
    return { success: false, error };
  }

  static fromError<T>(error: unknown): Result<T, Error> {
    if (error instanceof Error) {
      return ResultFactory.fail(error);
    }
    return ResultFactory.fail(new Error(String(error)));
  }
}

/**
 * Either Pattern - alternativa más funcional
 */
export type Either<L, R> = Left<L> | Right<R>;

export class Left<L> {
  readonly _tag = 'Left';
  readonly value: L;
  
  constructor(value: L) {
    this.value = value;
  }

  isLeft(): this is Left<L> {
    return true;
  }

  isRight(): this is never {
    return false;
  }

  map<R2>(_fn: (value: never) => R2): Either<L, R2> {
    return this as any;
  }

  flatMap<R2>(_fn: (value: never) => Either<L, R2>): Either<L, R2> {
    return this as any;
  }
}

export class Right<R> {
  readonly _tag = 'Right';
  readonly value: R;
  
  constructor(value: R) {
    this.value = value;
  }

  isLeft(): this is never {
    return false;
  }

  isRight(): this is Right<R> {
    return true;
  }

  map<R2>(fn: (value: R) => R2): Either<never, R2> {
    return new Right(fn(this.value));
  }

  flatMap<L, R2>(fn: (value: R) => Either<L, R2>): Either<L, R2> {
    return fn(this.value);
  }
}

export const left = <L>(value: L): Either<L, never> => new Left(value);
export const right = <R>(value: R): Either<never, R> => new Right(value);
