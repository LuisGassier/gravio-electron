import { Result, ResultFactory } from '../shared/Result'

/**
 * Props para crear una entidad FolioSequence
 */
export interface FolioSequenceProps {
  id?: string
  claveEmpresa: number
  prefijoEmpresa: string
  ultimoNumero: number
  sincronizado: boolean
  updatedAt: Date
}

/**
 * Entidad de dominio: FolioSequence
 * Representa el contador de folios por empresa
 */
export class FolioSequence {
  readonly id: string
  readonly claveEmpresa: number
  readonly prefijoEmpresa: string
  readonly ultimoNumero: number
  readonly sincronizado: boolean
  readonly updatedAt: Date

  private constructor(props: Required<FolioSequenceProps>) {
    this.id = props.id
    this.claveEmpresa = props.claveEmpresa
    this.prefijoEmpresa = props.prefijoEmpresa
    this.ultimoNumero = props.ultimoNumero
    this.sincronizado = props.sincronizado
    this.updatedAt = props.updatedAt
  }

  /**
   * Factory method para crear una secuencia de folio
   */
  static create(props: FolioSequenceProps): Result<FolioSequence> {
    // Validaciones
    if (!props.claveEmpresa || props.claveEmpresa < 0) {
      return ResultFactory.fail(new Error('claveEmpresa debe ser un número positivo'))
    }

    if (!props.prefijoEmpresa || props.prefijoEmpresa.length !== 4) {
      return ResultFactory.fail(new Error('prefijoEmpresa debe tener exactamente 4 caracteres'))
    }

    if (!/^[A-Z]{4}$/.test(props.prefijoEmpresa)) {
      return ResultFactory.fail(new Error('prefijoEmpresa debe contener solo letras mayúsculas'))
    }

    if (props.ultimoNumero < 0) {
      return ResultFactory.fail(new Error('ultimoNumero no puede ser negativo'))
    }

    const sequence = new FolioSequence({
      id: props.id || `seq-${props.claveEmpresa}`,
      claveEmpresa: props.claveEmpresa,
      prefijoEmpresa: props.prefijoEmpresa.toUpperCase(),
      ultimoNumero: props.ultimoNumero,
      sincronizado: props.sincronizado ?? false,
      updatedAt: props.updatedAt || new Date(),
    })

    return ResultFactory.ok(sequence)
  }

  /**
   * Incrementa el número de la secuencia
   */
  increment(): Result<FolioSequence> {
    return FolioSequence.create({
      ...this.toObject(),
      ultimoNumero: this.ultimoNumero + 1,
      sincronizado: false,
      updatedAt: new Date(),
    })
  }

  /**
   * Genera el siguiente folio formateado
   */
  getNextFolio(): string {
    const siguienteNumero = this.ultimoNumero + 1
    return this.formatFolio(siguienteNumero)
  }

  /**
   * Formatea un número como folio (PREF-0000001)
   */
  private formatFolio(numero: number): string {
    return `${this.prefijoEmpresa}-${numero.toString().padStart(7, '0')}`
  }

  /**
   * Marca la secuencia como sincronizada
   */
  markAsSynchronized(): Result<FolioSequence> {
    return FolioSequence.create({
      ...this.toObject(),
      sincronizado: true,
      updatedAt: new Date(),
    })
  }

  /**
   * Actualiza el último número si el remoto es mayor
   */
  updateFromRemote(remoteNumber: number): Result<FolioSequence> {
    const newNumber = Math.max(this.ultimoNumero, remoteNumber)
    
    return FolioSequence.create({
      ...this.toObject(),
      ultimoNumero: newNumber,
      sincronizado: true,
      updatedAt: new Date(),
    })
  }

  /**
   * Convierte a objeto plano
   */
  toObject(): FolioSequenceProps {
    return {
      id: this.id,
      claveEmpresa: this.claveEmpresa,
      prefijoEmpresa: this.prefijoEmpresa,
      ultimoNumero: this.ultimoNumero,
      sincronizado: this.sincronizado,
      updatedAt: this.updatedAt,
    }
  }
}
