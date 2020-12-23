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
  ErrFieldCount = 'wrong number of fields'
}

export class ParseError extends Error {
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
  }
}

export class BufferFullError extends Error {
  constructor() {
    super('buffer full')
  }
}

export class EOF extends Error {}
