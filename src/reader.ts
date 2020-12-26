import SliceReader from './slice_reader'
import { appendBytesArray, bytesSlice, indexRune, trimLeftFunc } from './byte'
import { ParseError, ParseErrMessage } from './errors'
import { isSpace } from './unicode'
import { decodeRune, runeCount, RuneError, validRune } from './utf8'

/**
 * Called once for each record. If this callback returns `true`
 * then abort reading prematurely.
 * @typedef {Object} ReaderConfig
 * @property {string|undefined} comma - The field delimiter.
 * It is set to comma (',') by NewReader.
 * Comma must be a valid rune and must not be \r, \n,
 * or the Unicode replacement character (0xFFFD).
 * @property {string|undefined} comment - Comment, if not 0, is the comment character.
 * Lines beginning with the comment character without preceding whitespace are ignored.
 * With leading whitespace the comment character becomes part of the
 * field, even if {@link ReaderConfig#trimLeadingSpace} is true.
 * Comment must be a valid rune and must not be \r, \n,
 * or the Unicode replacement character (0xFFFD).
 * It must also not be equal to {@link ReaderConfig#comma}.
 * @property {number|undefined} fieldsPerRecord - The number of expected fields per record.
 * If fieldsPerRecord is positive, Read requires each record to
 * have the given number of fields. If fieldsPerRecord is 0, Read sets it to
 * the number of fields in the first record, so that future records must
 * have the same field count. If fieldsPerRecord is negative, no check is
 * made and records may have a variable number of fields.
 * @property {boolean|undefined} lazyQuotes - If LazyQuotes is true,
 * a quote may appear in an unquoted field and a
 * non-doubled quote may appear in a quoted field.
 * @property {boolean|undefined} trimLeadingSpace - If TrimLeadingSpace is true,
 * leading white space in a field is ignored.
 * This is done even if the field delimiter, Comma, is white space.
 */
type ReaderConfig = {
  comma?: string
  comment?: string
  fieldsPerRecord?: number
  lazyQuotes?: boolean
  trimLeadingSpace?: boolean
}

class ReaderError extends Error {
  constructor(message: string) {
    super(`csv.Reader: ${message}`)
  }
}

export const errInvalidDelim = new ReaderError('invalid field or comment delimiter')

const validDelim = (r: number) => {
  return (
    r !== 0 &&
    r !== '"'.charCodeAt(0) &&
    r !== '\r'.charCodeAt(0) &&
    r !== '\n'.charCodeAt(0) &&
    validRune(r) &&
    r !== RuneError
  )
}

// lengthNL reports the number of bytes for the trailing \n.
const lengthNL = (b?: Uint8Array) => {
  if (b && b.length > 0 && b[b.length - 1] === '\n'.charCodeAt(0)) {
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

/**
 * @class
 */
export default class Reader {
  comma = 0
  comment = 0
  commaLen = 0
  fieldsPerRecord = 0
  lazyQuotes = false
  trimLeadingSpace = false
  r: SliceReader
  numLine = 0
  line = new Uint8Array()
  fullLine = new Uint8Array()
  fieldIndexes: number[] = []
  lastRecord = []
  parsingQuotedString = false
  recLine = 0
  rawBuffer = new Uint8Array()
  recordBuffer = new Uint8Array()

  /**
   * Create a new instance of Reader.
   * @constructor
   * @param {ReadableStream|string|Uint8Array} input - CSV text string, bytes array or readable stream of those types.
   * @param {ReaderConfig|undefined} config - If present then override default settings.
   */
  constructor(input: ReadableStream | string | Uint8Array, config?: ReaderConfig) {
    this.r = new SliceReader(input)
    this.setComma(',')
    if (config) {
      if (config.comma && config.comma.length > 1) {
        throw new Error('invalid config: comma can be one character only')
      }
      if (config.comment && config.comment.length > 1) {
        throw new Error('invalid config: comment can be one character only')
      }
      if (config.comma) {
        this.setComma(config.comma)
      }
      if (config.comment) {
        this.setComment(config.comment)
      }
      this.fieldsPerRecord = config.fieldsPerRecord || this.fieldsPerRecord
      this.lazyQuotes = config.lazyQuotes || this.lazyQuotes
      this.trimLeadingSpace = config.trimLeadingSpace || this.trimLeadingSpace
    }
  }

  /**
   * @ignore
   */
  setComma(cstr: string): void {
    const b = new TextEncoder().encode(cstr)
    const res = decodeRune(b)
    this.comma = res[0]
    this.commaLen = res[1]
  }

  /**
   * @ignore
   */
  setComment(cstr: string): void {
    const b = new TextEncoder().encode(cstr)
    const res = decodeRune(b)
    this.comment = res[0]
  }

  private _readLine(): Uint8Array | null {
    const nl = '\n'.charCodeAt(0)
    const cr = '\r'.charCodeAt(0)
    const sl = this.r.readSlice(nl)
    if (sl === null) return sl
    let line = sl as Uint8Array

    if (line.length > 0 && this.r.eof) {
      // For backwards compatibility, drop trailing \r before EOF.
      if (line[line.length - 1] === '\r'.charCodeAt(0)) {
        line = new Uint8Array(line.buffer, line.byteOffset, line.length - 1)
      }
    }
    this.numLine++
    // Normalize \r\n to \n on all input lines.
    const n = line.length
    if (n >= 2 && line[n - 2] === cr && line[n - 1] === nl) {
      line[n - 2] = nl
      line = new Uint8Array(line.buffer, line.byteOffset, n - 1)
    }
    return line
  }

  private _validateCommaComment(): void {
    if (
      this.comma === this.comment ||
      !validDelim(this.comma) ||
      (this.comment !== 0 && !validDelim(this.comment))
    ) {
      throw errInvalidDelim
    }
  }

  private _handleEOF(): void {
    // Abrupt end of file (EOF or error).
    if (!this.lazyQuotes) {
      const col = runeCount(this.fullLine)
      throw new ParseError({
        startLine: this.recLine,
        line: this.numLine,
        column: col,
        err: ParseErrMessage.ErrQuote,
      })
    }
    this.fieldIndexes.push(this.recordBuffer.length)
    this.parsingQuotedString = false
  }

  private _readRecord(dst?: string[]): string[] {
    this._validateCommaComment()

    // Read line (automatically skipping past empty lines and any comments).
    if (this.parsingQuotedString) {
      const sl = this._readLine()
      if (sl === null) {
        return []
      }
      this.line = sl
      this.fullLine = this.line
    } else {
      this.line = new Uint8Array()
      this.fullLine = new Uint8Array()
      while (true) {
        const sl = this._readLine()
        if (sl === null) return []
        this.line = sl
        if (this.comment !== 0 && nextRune(this.line) === this.comment) {
          this.line = new Uint8Array()
          continue // Skip comment lines
        }
        if (this.line.length > 0 && this.line.length === lengthNL(this.line)) {
          this.line = new Uint8Array()
          continue // Skip empty lines
        }
        this.fullLine = this.line
        break
      }
      if (this.fullLine.length === 0) {
        return []
      }
    }

    // Parse each field in the record.
    const quoteLen = 1
    const qr = '"'.charCodeAt(0)
    if (!this.parsingQuotedString) {
      this.recordBuffer = new Uint8Array(0)
      this.fieldIndexes = []
      this.recLine = this.numLine // Starting line for record
    }
    while (true) {
      if (this.parsingQuotedString) {
        const i = this.line.indexOf(qr)
        if (i >= 0) {
          // Hit next quote.
          this.recordBuffer = appendBytesArray(this.recordBuffer, bytesSlice(this.line, 0, i))
          this.line = bytesSlice(this.line, i + quoteLen)
          const rn = nextRune(this.line)

          if (rn === qr) {
            // `""` sequence (append quote).
            this.recordBuffer = appendBytesArray(this.recordBuffer, new Uint8Array([qr]))
            this.line = bytesSlice(this.line, quoteLen)
          } else if (rn === this.comma) {
            // `",` sequence (end of field).
            this.line = bytesSlice(this.line, this.commaLen)
            this.fieldIndexes.push(this.recordBuffer.length)
            this.parsingQuotedString = false
            continue
          } else if (lengthNL(this.line) === this.line.length) {
            // `"\n` sequence (end of line).
            this.fieldIndexes.push(this.recordBuffer.length)
            this.parsingQuotedString = false
            break
          } else if (this.lazyQuotes) {
            // `"` sequence (bare quote).
            this.recordBuffer = appendBytesArray(this.recordBuffer, new Uint8Array([qr]))
          } else {
            // `"*` sequence (invalid non-escaped quote).
            const col = runeCount(
              bytesSlice(this.fullLine, 0, this.fullLine.length - this.line.length - quoteLen)
            )
            throw new ParseError({
              startLine: this.recLine,
              line: this.numLine,
              column: col,
              err: ParseErrMessage.ErrQuote,
            })
          }
        } else if (this.line.length > 0) {
          // Hit end of line (copy all data so far).
          this.recordBuffer = appendBytesArray(this.recordBuffer, this.line)
          const sl = this._readLine()
          if (sl === null) {
            if (this.r.eof) {
              this._handleEOF()
              break
            }
            return []
          }
          this.line = sl
          this.fullLine = this.line
        } else {
          this._handleEOF()
          break
        }
      } else {
        if (this.trimLeadingSpace) {
          this.line = trimLeftFunc(this.line, isSpace)
        }
        if (this.line.length === 0 || this.line[0] !== qr) {
          // Non-quoted string field
          const i = indexRune(this.line, this.comma)
          let field = this.line
          if (i >= 0) {
            field = bytesSlice(field, 0, i)
          } else {
            field = bytesSlice(field, 0, field.length - lengthNL(field))
          }
          // Check to make sure a quote does not appear in field.
          if (!this.lazyQuotes) {
            const j = field.indexOf(qr)
            if (j >= 0) {
              const col = runeCount(
                bytesSlice(this.fullLine, 0, this.fullLine.length - bytesSlice(this.line, j).length)
              )
              throw new ParseError({
                startLine: this.recLine,
                line: this.numLine,
                column: col,
                err: ParseErrMessage.ErrBareQuote,
              })
            }
          }
          this.recordBuffer = appendBytesArray(this.recordBuffer, field)
          this.fieldIndexes.push(this.recordBuffer.length)
          if (i >= 0) {
            this.line = bytesSlice(this.line, i + this.commaLen)
            continue
          }
          break
        } else {
          // Quoted string field
          this.parsingQuotedString = true
          this.line = bytesSlice(this.line, quoteLen)
        }
      }
    }

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
      dst[i] = decoder.decode(bytesSlice(this.recordBuffer, preIdx, idx))
      preIdx = idx
    }

    // Check or update the expected fields per record.
    if (this.fieldsPerRecord > 0) {
      if (dst.length !== this.fieldsPerRecord) {
        throw new ParseError({
          startLine: this.recLine,
          line: this.recLine,
          err: ParseErrMessage.ErrFieldCount,
        })
      }
    } else if (this.fieldsPerRecord === 0) {
      this.fieldsPerRecord = dst.length
    }
    return dst
  }

  /**
   * Called once for each record. If this callback returns `true`
   * then abort reading prematurely.
   * @callback Reader~recordCallback
   * @param {string[]} record - Array of fields in this record.
   * @returns {boolean|undefined} Whether to abort reading.
   */

  /**
   * Read all the remaining records.
   * @param {Reader~recordCallback} cb - The callback that will be called with each record.
   * @returns {Promise} Resolve when there's no record left or if reading is aborted.
   */
  async readAll(cb: (record: string[]) => boolean | void): Promise<void> {
    do {
      await this.r.fill()
      while (true) {
        const record = this._readRecord()
        if (record.length === 0) {
          break
        }
        if (cb(record)) return
      }
    } while (!this.r.eof)
  }
}
