/**
 * Common error class for anything that might go wrong with Reader
 */
export class ReaderError extends Error {
  constructor(message: string) {
    super(`csv.Reader: ${message}`)
    Object.setPrototypeOf(this, ReaderError.prototype)
  }
}

type ParseErrorArgs = {
  startLine: number
  line: number
  column?: number
  err: ParseErrMessage
}

export enum ParseErrMessage {
  ErrTrailingComma = 'extra delimiter at end of line',
  ErrBareQuote = 'bare " in non-quoted-field',
  ErrQuote = 'extraneous or missing " in quoted-field',
  ErrFieldCount = 'wrong number of fields',
}

/**
 * Common error class for parse errors
 */
export class ParseError extends ReaderError {
  constructor(args: ParseErrorArgs) {
    if (args.err === ParseErrMessage.ErrFieldCount) {
      super(`record on line ${args.line}: ${args.err}`)
    } else if (args.startLine !== args.line) {
      super(
        `record on line ${args.startLine}; parse error on line ${args.line}, column ${args.column}: ${args.err}`
      )
    } else {
      super(`parse error on line ${args.line}, column ${args.column}: ${args.err}`)
    }
    Object.setPrototypeOf(this, ParseError.prototype)
  }
}

export class EOF extends Error {}
