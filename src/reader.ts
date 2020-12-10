import BufferedReader from './buffered_reader'
import { appendBytesArray, byte, bytesLength, indexRune, trimLeftFunc } from './byte'
import { ParseError, ParseErrMessage } from './errors'
import { isSpace } from './unicode'
import { decodeRune, runeCount, RuneError, validRune } from './utf8'

type ReaderConfig = {
  comma?: string
  comment?: string
  fieldsPerRecord?: number
  lazyQuotes?: boolean
  trimLeadingSpace?: boolean
}

class ReaderError extends Error {
  constructor(message) {
    super(`csv.Reader: ${message}`)
  }
}

export const errInvalidDelim = new ReaderError('invalid field or comment delimiter')

const validDelim = (r: number) => {
  return (
    r !== 0 &&
    r != '"'.charCodeAt(0) &&
    r != '\r'.charCodeAt(0) &&
    r != '\n'.charCodeAt(0) &&
    validRune(r) &&
    r != RuneError
  )
}

// lengthNL reports the number of bytes for the trailing \n.
const lengthNL = (b?: Uint8Array) => {
  if (b && b.length > 0 && b[b.length - 1] === byte('\n')) {
    return 1
  }
  return 0
}

// nextRune returns the next rune in b or utf8.RuneError.
const nextRune = (b?: Uint8Array) => {
  if (!b) return 0
  const [r, _] = decodeRune(b)
  return r
}

export default class Reader {
  comma = 0
  comment = 0
  fieldsPerRecord = 0
  lazyQuotes = false
  trimLeadingSpace = false
  r: BufferedReader
  numLine = 0
  fieldIndexes: number[] = []
  lastRecord = []
  rawBuffer = new Uint8Array()
  recordBuffer = new Uint8Array()

  constructor(inputStream: ReadableStream, config?: ReaderConfig) {
    this.r = new BufferedReader(inputStream)
    this.comma = ','.charCodeAt(0)
    if (config) {
      if (config.comma && config.comma.length > 1)
        throw new Error('invalid config: comma can be one character only')
      if (config.comment && config.comment.length > 1)
        throw new Error('invalid config: comment can be one character only')
      this.comma = config.comma ? config.comma.charCodeAt(0) : this.comma
      this.comment = config.comment ? config.comment.charCodeAt(0) : this.comment
      this.fieldsPerRecord = config.fieldsPerRecord || this.fieldsPerRecord
      this.lazyQuotes = config.lazyQuotes || this.lazyQuotes
      this.trimLeadingSpace = config.trimLeadingSpace || this.trimLeadingSpace
    }
  }

  async readLine(): Promise<Uint8Array> {
    const nl = '\n'.charCodeAt(0)
    const cr = '\r'.charCodeAt(0)
    let line
    try {
      line = await this.r.readSlice(nl)
    } catch (e) {
      if (e.message.indexOf('buffer is full') !== -1) {
        this.rawBuffer = Uint8Array.from(this.r.line)
        while (true) {
          try {
            await this.r.readSlice(nl)
          } catch (e) {
            if (e.message.indexOf('buffer is full') === -1) {
              throw e
            }
            this.rawBuffer = appendBytesArray(this.rawBuffer, this.r.line)
          }
          break
        }
        line = this.rawBuffer
      } else {
        throw e
      }
    }
    // TODO: drop trailing \r before EOF
    // if len(line) > 0 && err === io.EOF {
    //   err = nil
    //   // For backwards compatibility, drop trailing \r before EOF.
    //   if (line[line.length-1] === '\r') {
    //     line = line[:len(line)-1]
    //   }
    // }
    this.numLine++
    // Normalize \r\n to \n on all input lines.
    const n = line.length
    if (n >= 2 && line[n - 2] === cr && line[n - 1] === nl) {
      line[n - 2] = nl
      line = line.slice(0, n - 1)
    }
    return line
  }

  async parseQuotedField(
    fullLine: Uint8Array,
    line: Uint8Array,
    quoteLen: number,
    commaLen: number,
    recLine: number
  ): Promise<[Uint8Array, Uint8Array]> {
    // Quoted string field
    line = line.slice(quoteLen)
    const qr = '"'.charCodeAt(0)
    while (true) {
      const i = line.indexOf(qr)
      if (i >= 0) {
        // Hit next quote.
        this.recordBuffer = appendBytesArray(this.recordBuffer, line.slice(0, i))
        line = line.slice(i + quoteLen)
        const rn = nextRune(line)

        if (rn === qr) {
          // `""` sequence (append quote).
          this.recordBuffer = appendBytesArray(this.recordBuffer, new Uint8Array(qr))
          line = line.slice(quoteLen)
        } else if (rn === this.comma) {
          // `",` sequence (end of field).
          line = line.slice(commaLen)
          this.fieldIndexes.push(this.recordBuffer.length)
          return [line, fullLine]
        } else if (lengthNL(line) === line.length) {
          // `"\n` sequence (end of line).
          this.fieldIndexes.push(this.recordBuffer.length)
          break
        } else if (this.lazyQuotes) {
          // `"` sequence (bare quote).
          this.recordBuffer = appendBytesArray(this.recordBuffer, new Uint8Array(qr))
        } else {
          // `"*` sequence (invalid non-escaped quote).
          const col = runeCount(fullLine.slice(0, fullLine.length - line.length - quoteLen))
          throw new ParseError({
            startLine: recLine,
            line: this.numLine,
            column: col,
            err: ParseErrMessage.ErrQuote
          })
        }
      } else if (line.length > 0) {
        // Hit end of line (copy all data so far).
        this.recordBuffer = appendBytesArray(this.recordBuffer, line)
        // if errRead != nil {
        // 	break
        // }
        line = await this.readLine()
        // if errRead === io.EOF {
        // 	errRead = nil
        // }
        fullLine = line
      } else {
        // Abrupt end of file (EOF or error).
        if (!this.lazyQuotes) {
          const col = runeCount(fullLine)
          throw new ParseError({
            startLine: recLine,
            line: this.numLine,
            column: col,
            err: ParseErrMessage.ErrQuote
          })
        }
        this.fieldIndexes.push(this.recordBuffer.length)
        break
      }
    }
    return [line, fullLine]
  }

  async readRecord(dst?: string[]): Promise<string[]> {
    if (
      this.comma === this.comment ||
      !validDelim(this.comma) ||
      (this.comment !== 0 && !validDelim(this.comment))
    ) {
      throw errInvalidDelim
    }

    // Read line (automatically skipping past empty lines and any comments).
    let line = new Uint8Array()
    let fullLine = new Uint8Array()
    let errRead: Error | undefined
    while (!errRead) {
      try {
        line = await this.readLine()
      } catch (e) {
        errRead = e
      }
      if (this.comment !== 0 && nextRune(line) === this.comment) {
        line = new Uint8Array()
        continue // Skip comment lines
      }
      if (!errRead && line.length === lengthNL(line)) {
        line = new Uint8Array()
        continue // Skip empty lines
      }
      fullLine = line
      break
    }
    // if (errRead === io.EOF) {
    //   return nil, errRead
    // }

    // Parse each field in the record.
    const quoteLen = 1
    const commaLen = bytesLength(this.comma)
    const recLine = this.numLine // Starting line for record
    this.recordBuffer = this.recordBuffer.slice(0, 0)
    this.fieldIndexes = this.fieldIndexes.slice(0, 0)
    while (true) {
      if (this.trimLeadingSpace) {
        line = trimLeftFunc(line, isSpace)
      }
      if (line.length === 0 || line[0] !== byte('"')) {
        // Non-quoted string field
        const i = indexRune(line, this.comma)
        let field = line
        if (i >= 0) {
          field = field.slice(0, i)
        } else {
          field = field.slice(0, field.length - lengthNL(field))
        }
        // Check to make sure a quote does not appear in field.
        if (!this.lazyQuotes) {
          const j = field.indexOf('"'.charCodeAt(0))
          if (j >= 0) {
            const col = runeCount(fullLine.slice(0, fullLine.length - line.slice(j).length))
            throw new ParseError({
              startLine: recLine,
              line: this.numLine,
              column: col,
              err: ParseErrMessage.ErrBareQuote
            })
            break
          }
        }
        this.recordBuffer = appendBytesArray(this.recordBuffer, field)
        this.fieldIndexes.push(this.recordBuffer.length)
        if (i >= 0) {
          line = line.slice(i + commaLen)
          continue
        }
        break
      } else {
        const res = await this.parseQuotedField(fullLine, line, quoteLen, commaLen, recLine)
        line = res[0]
        fullLine = res[1]
      }
    }

    // Create a single string and create slices out of it.
    // This pins the memory of the fields together, but allocates once.
    const str = this.recordBuffer // Convert to string once to batch allocations
    if (!dst) {
      dst = []
    }
    if (dst.length > this.fieldIndexes.length) {
      dst = dst.slice(0, this.fieldIndexes.length)
    }
    let preIdx = 0
    const decoder = new TextDecoder()
    for (let i = 0; i < this.fieldIndexes.length; i++) {
      const idx = this.fieldIndexes[i]
      dst[i] = decoder.decode(this.recordBuffer.slice(preIdx, idx))
      preIdx = idx
    }

    // Check or update the expected fields per record.
    if (this.fieldsPerRecord > 0) {
      if (dst.length !== this.fieldsPerRecord) {
        throw new ParseError({
          startLine: recLine,
          line: recLine,
          err: ParseErrMessage.ErrFieldCount
        })
      }
    } else if (this.fieldsPerRecord === 0) {
      this.fieldsPerRecord = dst.length
    }
    return dst
  }

  // Read reads one record (a slice of fields) from r.
  // If the record has an unexpected number of fields,
  // Read returns the record along with the error ErrFieldCount.
  // Except for that case, Read always returns either a non-nil
  // record or a non-nil error, but not both.
  // If there is no data left to be read, Read returns nil, io.EOF.
  // If ReuseRecord is true, the returned slice may be shared
  // between multiple calls to Read.
  async read(): Promise<string[]> {
    return this.readRecord()
  }
}
